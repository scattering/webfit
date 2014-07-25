
import numpy
import types
import scipy.lib.blas

class mpfit:

	blas_enorm32, = scipy.lib.blas.get_blas_funcs(['nrm2'],numpy.array([0],dtype=numpy.float32))
	blas_enorm64, = scipy.lib.blas.get_blas_funcs(['nrm2'],numpy.array([0],dtype=numpy.float64))


	def __init__(self, fcn, xall=None, functkw={}, parinfo=None,
				 ftol=1.e-5, xtol=1.e-5, gtol=1.e-5,
				 damp=0., maxiter=200, factor=100., nprint=1,
				 iterfunct='default', iterkw={}, nocovar=0,
				 rescale=0, autoderivative=1, quiet=0,
				 diag=None, epsfcn=None, debug=0):

		self.niter = 0
		self.params = None
		self.covar = None
		self.perror = None
		self.status = 0  # Invalid input flag set while we check inputs
		self.debug = debug
		self.errmsg = ''
		self.nfev = 0
		self.damp = damp
		self.dof=0

		if fcn==None:
			self.errmsg = "Usage: parms = mpfit('myfunt', ... )"
			return

		if iterfunct == 'default':
			iterfunct = self.defiter

		# Parameter damping doesn't work when user is providing their own
		# gradients.
		if (self.damp != 0) and (autoderivative == 0):
			self.errmsg =  'ERROR: keywords DAMP and AUTODERIVATIVE are mutually exclusive'
			return

		# Parameters can either be stored in parinfo, or x. x takes precedence if it exists
		if (xall is None) and (parinfo is None):
			self.errmsg = 'ERROR: must pass parameters in P or PARINFO'
			return

		# Be sure that PARINFO is of the right type
		if parinfo is not None:
			if type(parinfo) != types.ListType:
				self.errmsg = 'ERROR: PARINFO must be a list of dictionaries.'
				return
			else:
				if type(parinfo[0]) != types.DictionaryType:
					self.errmsg = 'ERROR: PARINFO must be a list of dictionaries.'
					return
			if ((xall is not None) and (len(xall) != len(parinfo))):
				self.errmsg = 'ERROR: number of elements in PARINFO and P must agree'
				return

		# If the parameters were not specified at the command line, then
		# extract them from PARINFO
		if xall is None:
			xall = self.parinfo(parinfo, 'value')
			if xall is None:
				self.errmsg = 'ERROR: either P or PARINFO(*)["value"] must be supplied.'
				return

		# Make sure parameters are numpy arrays
		xall = numpy.asarray(xall)
		# In the case if the xall is not float or if is float but has less 
		# than 64 bits we do convert it into double
		if xall.dtype.kind != 'f' or xall.dtype.itemsize<=4:
			xall = xall.astype(numpy.float)

		npar = len(xall)
		self.fnorm  = -1.
		fnorm1 = -1.

		# TIED parameters?
		ptied = self.parinfo(parinfo, 'tied', default='', n=npar)
		self.qanytied = 0
		for i in range(npar):
			ptied[i] = ptied[i].strip()
			if ptied[i] != '':
				self.qanytied = 1
		self.ptied = ptied

		# FIXED parameters ?
		pfixed = self.parinfo(parinfo, 'fixed', default=0, n=npar)
		pfixed = (pfixed == 1)
		for i in range(npar):
			pfixed[i] = pfixed[i] or (ptied[i] != '') # Tied parameters are also effectively fixed

		# Finite differencing step, absolute and relative, and sidedness of deriv.
		step = self.parinfo(parinfo, 'step', default=0., n=npar)
		dstep = self.parinfo(parinfo, 'relstep', default=0., n=npar)
		dside = self.parinfo(parinfo, 'mpside',  default=0, n=npar)

		# Maximum and minimum steps allowed to be taken in one iteration
		maxstep = self.parinfo(parinfo, 'mpmaxstep', default=0., n=npar)
		minstep = self.parinfo(parinfo, 'mpminstep', default=0., n=npar)
		qmin = minstep != 0 
		qmin[:] = False # Remove minstep for now!!
		qmax = maxstep != 0
		if numpy.any(qmin & qmax & (maxstep<minstep)):
			self.errmsg = 'ERROR: MPMINSTEP is greater than MPMAXSTEP'
			return
		wh = (numpy.nonzero((qmin!=0.) | (qmax!=0.)))[0]
		qminmax = len(wh > 0)

		# Finish up the free parameters
		ifree = (numpy.nonzero(pfixed != 1))[0]
		nfree = len(ifree)
		if nfree == 0:
			self.errmsg = 'ERROR: no free parameters'
			return

		# Compose only VARYING parameters
		self.params = xall.copy()	  # self.params is the set of parameters to be returned
		x = self.params[ifree]  # x is the set of free parameters

		# LIMITED parameters ?
		limited = self.parinfo(parinfo, 'limited', default=[0,0], n=npar)
		limits = self.parinfo(parinfo, 'limits', default=[0.,0.], n=npar)
		if (limited is not None) and (limits is not None):
			# Error checking on limits in parinfo
			if numpy.any((limited[:,0] & (xall < limits[:,0])) |
								 (limited[:,1] & (xall > limits[:,1]))):
				self.errmsg = 'ERROR: parameters are not within PARINFO limits'
				return
			if numpy.any((limited[:,0] & limited[:,1]) &
								 (limits[:,0] >= limits[:,1]) &
								 (pfixed == 0)):
				self.errmsg = 'ERROR: PARINFO parameter limits are not consistent'
				return

			# Transfer structure values to local variables
			qulim = (limited[:,1])[ifree]
			ulim  = (limits [:,1])[ifree]
			qllim = (limited[:,0])[ifree]
			llim  = (limits [:,0])[ifree]

			if numpy.any((qulim!=0.) | (qllim!=0.)):
				qanylim = 1
			else:
				qanylim = 0
		else:
			# Fill in local variables with dummy values
			qulim = numpy.zeros(nfree)
			ulim  = x * 0.
			qllim = qulim
			llim  = x * 0.
			qanylim = 0

		n = len(x)
		# Check input parameters for errors
		if (n < 0) or (ftol <= 0) or (xtol <= 0) or (gtol <= 0) \
					or (maxiter < 0) or (factor <= 0):
			self.errmsg = 'ERROR: input keywords are inconsistent'
			return

		if rescale != 0:
			self.errmsg = 'ERROR: DIAG parameter scales are inconsistent'
			if len(diag) < n:
				return
			if numpy.any(diag <= 0):
				return
			self.errmsg = ''

		[self.status, fvec] = self.call(fcn, self.params, functkw)
		
		if self.status < 0:
			self.errmsg = 'ERROR: first call to "'+str(fcn)+'" failed'
			return
		# If the returned fvec has more than four bits I assume that we have 
		# double precision 
		# It is important that the machar is determined by the precision of 
		# the returned value, not by the precision of the input array
		if numpy.array([fvec]).dtype.itemsize>4:
			self.machar = machar(double=1)
			self.blas_enorm = mpfit.blas_enorm64
		else:
			self.machar = machar(double=0)
			self.blas_enorm = mpfit.blas_enorm32
		machep = self.machar.machep
		
		m = len(fvec)
		if m < n:
			self.errmsg = 'ERROR: number of parameters must not exceed data'
			return
		self.dof = m-nfree
		self.fnorm = self.enorm(fvec)

		# Initialize Levelberg-Marquardt parameter and iteration counter

		par = 0.
		self.niter = 1
		qtf = x * 0.
		self.status = 0

		# Beginning of the outer loop

		while(1):

			# If requested, call fcn to enable printing of iterates
			self.params[ifree] = x
			if self.qanytied:
				self.params = self.tie(self.params, ptied)

			if (nprint > 0) and (iterfunct is not None):
				if ((self.niter-1) % nprint) == 0:
					mperr = 0
					xnew0 = self.params.copy()

					dof = numpy.max([len(fvec) - len(x), 0])
					status = iterfunct(fcn, self.params, self.niter, self.fnorm**2,
					   functkw=functkw, parinfo=parinfo, quiet=quiet,
					   dof=dof, **iterkw)
					if status is not None:
						self.status = status

					# Check for user termination
					if self.status < 0:
						self.errmsg = 'WARNING: premature termination by ' + str(iterfunct)
						return

					# If parameters were changed (grrr..) then re-tie
					if numpy.max(numpy.abs(xnew0-self.params)) > 0:
						if self.qanytied:
							self.params = self.tie(self.params, ptied)
						x = self.params[ifree]


			# Calculate the jacobian matrix
			self.status = 2
			catch_msg = 'calling MPFIT_FDJAC2'
			fjac = self.fdjac2(fcn, x, fvec, step, qulim, ulim, dside,
						  epsfcn=epsfcn,
						  autoderivative=autoderivative, dstep=dstep,
						  functkw=functkw, ifree=ifree, xall=self.params)
			if fjac is None:
				self.errmsg = 'WARNING: premature termination by FDJAC2'
				return

			# Determine if any of the parameters are pegged at the limits
			if qanylim:
				catch_msg = 'zeroing derivatives of pegged parameters'
				whlpeg = (numpy.nonzero(qllim & (x == llim)))[0]
				nlpeg = len(whlpeg)
				whupeg = (numpy.nonzero(qulim & (x == ulim)))[0]
				nupeg = len(whupeg)
				# See if any "pegged" values should keep their derivatives
				if nlpeg > 0:
					# Total derivative of sum wrt lower pegged parameters
					for i in range(nlpeg):
						sum0 = sum(fvec * fjac[:,whlpeg[i]])
						if sum0 > 0:
							fjac[:,whlpeg[i]] = 0
				if nupeg > 0:
					# Total derivative of sum wrt upper pegged parameters
					for i in range(nupeg):
						sum0 = sum(fvec * fjac[:,whupeg[i]])
						if sum0 < 0:
							fjac[:,whupeg[i]] = 0

			# Compute the QR factorization of the jacobian
			[fjac, ipvt, wa1, wa2] = self.qrfac(fjac, pivot=1)
			
			# On the first iteration if "diag" is unspecified, scale
			# according to the norms of the columns of the initial jacobian
			catch_msg = 'rescaling diagonal elements'
			if self.niter == 1:
				if (rescale==0) or (len(diag) < n):
					diag = wa2.copy()
					diag[diag == 0] = 1.

				# On the first iteration, calculate the norm of the scaled x
				# and initialize the step bound delta
				wa3 = diag * x
				xnorm = self.enorm(wa3)
				delta = factor*xnorm
				if delta == 0.:
					delta = factor

			# Form (q transpose)*fvec and store the first n components in qtf
			catch_msg = 'forming (q transpose)*fvec'
			wa4 = fvec.copy()
			for j in range(n):
				lj = ipvt[j]
				temp3 = fjac[j,lj]
				if temp3 != 0:
					fj = fjac[j:,lj]
					wj = wa4[j:]
					# *** optimization wa4(j:*)
					wa4[j:] = wj - fj * sum(fj*wj) / temp3
				fjac[j,lj] = wa1[j]
				qtf[j] = wa4[j]
			# From this point on, only the square matrix, consisting of the
			# triangle of R, is needed.
			fjac = fjac[0:n, 0:n]
			fjac.shape = [n, n]
			temp = fjac.copy()
			for i in range(n):
				temp[:,i] = fjac[:, ipvt[i]]
			fjac = temp.copy()

			# Check for overflow.  This should be a cheap test here since FJAC
			# has been reduced to a (small) square matrix, and the test is
			# O(N^2).
			#wh = where(finite(fjac) EQ 0, ct)
			#if ct GT 0 then goto, FAIL_OVERFLOW

			# Compute the norm of the scaled gradient
			catch_msg = 'computing the scaled gradient'
			gnorm = 0.
			if self.fnorm != 0:
				for j in range(n):
					l = ipvt[j]
					if wa2[l] != 0:
						sum0 = sum(fjac[0:j+1,j]*qtf[0:j+1])/self.fnorm
						gnorm = numpy.max([gnorm,numpy.abs(sum0/wa2[l])])

			# Test for convergence of the gradient norm
			if gnorm <= gtol:
				self.status = 4
				break
			if maxiter == 0:
				self.status = 5
				break

			# Rescale if necessary
			if rescale == 0:
				diag = numpy.choose(diag>wa2, (wa2, diag))

			# Beginning of the inner loop
			while(1):

				# Determine the levenberg-marquardt parameter
				catch_msg = 'calculating LM parameter (MPFIT_)'
				[fjac, par, wa1, wa2] = self.lmpar(fjac, ipvt, diag, qtf,
													 delta, wa1, wa2, par=par)
				# Store the direction p and x+p. Calculate the norm of p
				wa1 = -wa1

				if (qanylim == 0) and (qminmax == 0):
					# No parameter limits, so just move to new position WA2
					alpha = 1.
					wa2 = x + wa1

				else:

					# Respect the limits.  If a step were to go out of bounds, then
					# we should take a step in the same direction but shorter distance.
					# The step should take us right to the limit in that case.
					alpha = 1.

					if qanylim:
						# Do not allow any steps out of bounds
						catch_msg = 'checking for a step out of bounds'
						if nlpeg > 0:
							wa1[whlpeg] = numpy.clip( wa1[whlpeg], 0., numpy.max(wa1))
						if nupeg > 0:
							wa1[whupeg] = numpy.clip(wa1[whupeg], numpy.min(wa1), 0.)

						dwa1 = numpy.abs(wa1) > machep
						whl = (numpy.nonzero(((dwa1!=0.) & qllim) & ((x + wa1) < llim)))[0]
						if len(whl) > 0:
							t = ((llim[whl] - x[whl]) /
								  wa1[whl])
							alpha = numpy.min([alpha, numpy.min(t)])
						whu = (numpy.nonzero(((dwa1!=0.) & qulim) & ((x + wa1) > ulim)))[0]
						if len(whu) > 0:
							t = ((ulim[whu] - x[whu]) /
								  wa1[whu])
							alpha = numpy.min([alpha, numpy.min(t)])

					# Obey any max step values.
					if qminmax:
						nwa1 = wa1 * alpha
						whmax = (numpy.nonzero((qmax != 0.) & (maxstep > 0)))[0]
						if len(whmax) > 0:
							mrat = numpy.max(numpy.abs(nwa1[whmax]) /
									   numpy.abs(maxstep[ifree[whmax]]))
							if mrat > 1:
								alpha = alpha / mrat

					# Scale the resulting vector
					wa1 = wa1 * alpha
					wa2 = x + wa1

					# Adjust the final output values.  If the step put us exactly
					# on a boundary, make sure it is exact.
					sgnu = (ulim >= 0) * 2. - 1.
					sgnl = (llim >= 0) * 2. - 1.
					# Handles case of 
					#        ... nonzero *LIM ... ...zero * LIM
					ulim1 = ulim * (1 - sgnu * machep) - (ulim == 0) * machep
					llim1 = llim * (1 + sgnl * machep) + (llim == 0) * machep
					wh = (numpy.nonzero((qulim!=0) & (wa2 >= ulim1)))[0]
					if len(wh) > 0:
						wa2[wh] = ulim[wh]
					wh = (numpy.nonzero((qllim!=0.) & (wa2 <= llim1)))[0]					
					if len(wh) > 0:
						wa2[wh] = llim[wh]
				# endelse
				wa3 = diag * wa1
				pnorm = self.enorm(wa3)
				
				# On the first iteration, adjust the initial step bound
				if self.niter == 1:
					delta = numpy.min([delta,pnorm])

				self.params[ifree] = wa2

				# Evaluate the function at x+p and calculate its norm
				mperr = 0
				catch_msg = 'calling '+str(fcn)
				[self.status, wa4] = self.call(fcn, self.params, functkw)
				if self.status < 0:
					self.errmsg = 'WARNING: premature termination by "'+fcn+'"'
					return
				fnorm1 = self.enorm(wa4)

				# Compute the scaled actual reduction
				catch_msg = 'computing convergence criteria'
				actred = -1.
				if (0.1 * fnorm1) < self.fnorm:
					actred = - (fnorm1/self.fnorm)**2 + 1.

				# Compute the scaled predicted reduction and the scaled directional
				# derivative
				for j in range(n):
					wa3[j] = 0
					wa3[0:j+1] = wa3[0:j+1] + fjac[0:j+1,j]*wa1[ipvt[j]]

				# Remember, alpha is the fraction of the full LM step actually
				# taken
				temp1 = self.enorm(alpha*wa3)/self.fnorm
				temp2 = (numpy.sqrt(alpha*par)*pnorm)/self.fnorm
				prered = temp1*temp1 + (temp2*temp2)/0.5
				dirder = -(temp1*temp1 + temp2*temp2)
				
				# Compute the ratio of the actual to the predicted reduction.
				ratio = 0.
				if prered != 0:
					ratio = actred/prered

				# Update the step bound
				if ratio <= 0.25:
					if actred >= 0:
						temp = .5
					else:
						temp = .5*dirder/(dirder + .5*actred)
					if ((0.1*fnorm1) >= self.fnorm) or (temp < 0.1):
						temp = 0.1
					delta = temp*numpy.min([delta,pnorm/0.1])
					par = par/temp
				else:
					if (par == 0) or (ratio >= 0.75):
						delta = pnorm/.5
						par = .5*par

				# Test for successful iteration
				if ratio >= 0.0001:
					# Successful iteration.  Update x, fvec, and their norms
					x = wa2
					wa2 = diag * x
					fvec = wa4
					xnorm = self.enorm(wa2)
					self.fnorm = fnorm1
					self.niter = self.niter + 1
				
				# Tests for convergence
				if (numpy.abs(actred) <= ftol) and (prered <= ftol) \
					 and (0.5 * ratio <= 1):
					 self.status = 1
				if delta <= xtol*xnorm:
					self.status = 2
				if (numpy.abs(actred) <= ftol) and (prered <= ftol) \
					 and (0.5 * ratio <= 1) and (self.status == 2):
					 self.status = 3
				if self.status != 0:
					break
				
				# Tests for termination and stringent tolerances
				if self.niter >= maxiter:
					self.status = 5
				if (numpy.abs(actred) <= machep) and (prered <= machep) \
					and (0.5*ratio <= 1):
					self.status = 6
				if delta <= machep*xnorm:
					self.status = 7
				if gnorm <= machep:
					self.status = 8
				if self.status != 0:
					break
				
				# End of inner loop. Repeat if iteration unsuccessful
				if ratio >= 0.0001:
					break

				# Check for over/underflow
				if ~numpy.all(numpy.isfinite(wa1) & numpy.isfinite(wa2) & \
							numpy.isfinite(x)) or ~numpy.isfinite(ratio):
					errmsg = ('''ERROR: parameter or function value(s) have become 
						'infinite; check model function for over- 'and underflow''')
					self.status = -16
					break
				#wh = where(finite(wa1) EQ 0 OR finite(wa2) EQ 0 OR finite(x) EQ 0, ct)
				#if ct GT 0 OR finite(ratio) EQ 0 then begin

			if self.status != 0:
				break;
		# End of outer loop.

		catch_msg = 'in the termination phase'
		# Termination, either normal or user imposed.
		if len(self.params) == 0:
			return
		if nfree == 0:
			self.params = xall.copy()
		else:
			self.params[ifree] = x
		if (nprint > 0) and (self.status > 0):
			catch_msg = 'calling ' + str(fcn)
			[status, fvec] = self.call(fcn, self.params, functkw)
			catch_msg = 'in the termination phase'
			self.fnorm = self.enorm(fvec)

		if (self.fnorm is not None) and (fnorm1 is not None):
			self.fnorm = numpy.max([self.fnorm, fnorm1])
			self.fnorm = self.fnorm**2.

		self.covar = None
		self.perror = None
		# (very carefully) set the covariance matrix COVAR
		if (self.status > 0) and (nocovar==0) and (n is not None) \
					   and (fjac is not None) and (ipvt is not None):
			sz = fjac.shape
			if (n > 0) and (sz[0] >= n) and (sz[1] >= n) \
				and (len(ipvt) >= n):

				catch_msg = 'computing the covariance matrix'
				cv = self.calc_covar(fjac[0:n,0:n], ipvt[0:n])
				cv.shape = [n, n]
				nn = len(xall)

				# Fill in actual covariance matrix, accounting for fixed
				# parameters.
				self.covar = numpy.zeros([nn, nn], dtype=float)
				for i in range(n):
					self.covar[ifree,ifree[i]] = cv[:,i]

				# Compute errors in parameters
				catch_msg = 'computing parameter errors'
				self.perror = numpy.zeros(nn, dtype=float)
				d = numpy.diagonal(self.covar)
				wh = (numpy.nonzero(d >= 0))[0]
				if len(wh) > 0:
					self.perror[wh] = numpy.sqrt(d[wh])
		return


	def __str__(self):
		return {'params': self.params,
			   'niter': self.niter,
			   'params': self.params,
			   'covar': self.covar,
			   'perror': self.perror,
			   'status': self.status,
			   'debug': self.debug,
			   'errmsg': self.errmsg,
			   'nfev': self.nfev,
			   'damp': self.damp
			   #,'machar':self.machar
			   }.__str__()

	# Default procedure to be called every iteration.  It simply prints
	# the parameter values.
	def defiter(self, fcn, x, iter, fnorm=None, functkw=None,
					   quiet=0, iterstop=None, parinfo=None,
					   format=None, pformat='%.10g', dof=1):

		if self.debug:
			print ('Entering defiter...')
		if quiet:
			return
		if fnorm is None:
			[status, fvec] = self.call(fcn, x, functkw)
			fnorm = self.enorm(fvec)**2

		# Determine which parameters to print
		nprint = len(x)
		print ("Iter ", ('%6i' % iter),"   CHI-SQUARE = ",('%.10g' % fnorm)," DOF = ", ('%i' % dof))
		for i in range(nprint):
			if (parinfo is not None) and (parinfo[i].has_key('parname')):
				p = '   ' + parinfo[i]['parname'] + ' = '
			else:
				p = '   P' + str(i) + ' = '
			if (parinfo is not None) and (parinfo[i].has_key('mpprint')):
				iprint = parinfo[i]['mpprint']
			else:
				iprint = 1
			if iprint:
				print (p + (pformat % x[i]) + '  ')
		return 0

	#  DO_ITERSTOP:
	#  if keyword_set(iterstop) then begin
	#	  k = get_kbrd(0)
	#	  if k EQ string(byte(7)) then begin
	#		  message, 'WARNING: minimization not complete', /info
	#		  print, 'Do you want to terminate this procedure? (y/n)', $
	#			format='(A,$)'
	#		  k = ''
	#		  read, k
	#		  if strupcase(strmid(k,0,1)) EQ 'Y' then begin
	#			  message, 'WARNING: Procedure is terminating.', /info
	#			  mperr = -1
	#		  endif
	#	  endif
	#  endif
	
	
	# Procedure to parse the parameter values in PARINFO, which is a list of dictionaries
	def parinfo(self, parinfo=None, key='a', default=None, n=0):
		if self.debug:
			print ('Entering parinfo...')
		if (n == 0) and (parinfo is not None):
			n = len(parinfo)
		if n == 0:
			values = default
	
			return values
		values = []
		for i in range(n):
			if (parinfo is not None) and (parinfo[i].has_key(key)):
				values.append(parinfo[i][key])
			else:
				values.append(default)

		# Convert to numeric arrays if possible
		test = default
		if type(default) == types.ListType:
			test=default[0]
		if isinstance(test, types.IntType):
			values = numpy.asarray(values, int)
		elif isinstance(test, types.FloatType):
			values = numpy.asarray(values, float)
		return values
	
	# Call user function or procedure, with _EXTRA or not, with
	# derivatives or not.
	def call(self, fcn, x, functkw, fjac=None):
		if self.debug:
			print ('Entering call...')
		if self.qanytied:
			x = self.tie(x, self.ptied)
		self.nfev = self.nfev + 1
		if fjac is None:
			[status, f] = fcn(x, fjac=fjac, **functkw)
			if self.damp > 0:
				# Apply the damping if requested.  This replaces the residuals
				# with their hyperbolic tangent.  Thus residuals larger than
				# DAMP are essentially clipped.
				f = numpy.tanh(f/self.damp)
			return [status, f]
		else:
			return fcn(x, fjac=fjac, **functkw)
	
	
	def enorm(self, vec):
		ans = self.blas_enorm(vec)
		return ans
	
	
	def fdjac2(self, fcn, x, fvec, step=None, ulimited=None, ulimit=None, dside=None,
			   epsfcn=None, autoderivative=1,
			   functkw=None, xall=None, ifree=None, dstep=None):

		if self.debug:
			print ('Entering fdjac2...')
		machep = self.machar.machep
		if epsfcn is None:
			epsfcn = machep
		if xall is None:
			xall = x
		if ifree is None:
			ifree = numpy.arange(len(xall))
		if step is None:
			step = x * 0.
		nall = len(xall)

		eps = numpy.sqrt(numpy.max([epsfcn, machep]))
		m = len(fvec)
		n = len(x)

		# Compute analytical derivative if requested
		if autoderivative == 0:
			mperr = 0
			fjac = numpy.zeros(nall, dtype=float)
			fjac[ifree] = 1.0  # Specify which parameters need derivatives
			[status, fp] = self.call(fcn, xall, functkw, fjac=fjac)

			if len(fjac) != m*nall:
				print ('ERROR: Derivative matrix was not computed properly.')
				return None

			# This definition is consistent with CURVEFIT
			# Sign error found (thanks Jesus Fernandez <fernande@irm.chu-caen.fr>)
			fjac.shape = [m,nall]
			fjac = -fjac

			# Select only the free parameters
			if len(ifree) < nall:
				fjac = fjac[:,ifree]
				fjac.shape = [m, n]
				return fjac

		fjac = numpy.zeros([m, n], dtype=float)

		h = eps * numpy.abs(x)

		# if STEP is given, use that
		# STEP includes the fixed parameters
		if step is not None:
			stepi = step[ifree]
			wh = (numpy.nonzero(stepi > 0))[0]
			if len(wh) > 0:
				h[wh] = stepi[wh]

		# if relative step is given, use that
		# DSTEP includes the fixed parameters
		if len(dstep) > 0:
			dstepi = dstep[ifree]
			wh = (numpy.nonzero(dstepi > 0))[0]
			if len(wh) > 0:
				h[wh] = numpy.abs(dstepi[wh]*x[wh])

		# In case any of the step values are zero
		h[h == 0] = eps

		# Reverse the sign of the step if we are up against the parameter
		# limit, or if the user requested it.
		# DSIDE includes the fixed parameters (ULIMITED/ULIMIT have only
		# varying ones)
		mask = dside[ifree] == -1
		if len(ulimited) > 0 and len(ulimit) > 0:
			mask = (mask | ((ulimited!=0) & (x > ulimit-h)))
			wh = (numpy.nonzero(mask))[0]
			if len(wh) > 0:
				h[wh] = - h[wh]
		# Loop through parameters, computing the derivative for each
		for j in range(n):
			xp = xall.copy()
			xp[ifree[j]] = xp[ifree[j]] + h[j]
			[status, fp] = self.call(fcn, xp, functkw)
			if status < 0:
				return None

			if numpy.abs(dside[ifree[j]]) <= 1:
				# COMPUTE THE ONE-SIDED DERIVATIVE
				# Note optimization fjac(0:*,j)
				fjac[0:,j] = (fp-fvec)/h[j]

			else:
				# COMPUTE THE TWO-SIDED DERIVATIVE
				xp[ifree[j]] = xall[ifree[j]] - h[j]

				mperr = 0
				[status, fm] = self.call(fcn, xp, functkw)
				if status < 0:
					return None

				# Note optimization fjac(0:*,j)
				fjac[0:,j] = (fp-fm)/(2*h[j])
		return fjac
	
	
	
	#	 Original FORTRAN documentation
	#	 **********
	#
	#	 subroutine qrfac
	#
	#	 this subroutine uses householder transformations with column
	#	 pivoting (optional) to compute a qr factorization of the
	#	 m by n matrix a. that is, qrfac determines an orthogonal
	#	 matrix q, a permutation matrix p, and an upper trapezoidal
	#	 matrix r with diagonal elements of nonincreasing magnitude,
	#	 such that a*p = q*r. the householder transformation for
	#	 column k, k = 1,2,...,min(m,n), is of the form
	#
	#						t
	#		i - (1/u(k))*u*u
	#
	#	 where u has zeros in the first k-1 positions. the form of
	#	 this transformation and the method of pivoting first
	#	 appeared in the corresponding linpack subroutine.
	#
	#	 the subroutine statement is
	#
	#	subroutine qrfac(m,n,a,lda,pivot,ipvt,lipvt,rdiag,acnorm,wa)
	#
	#	 where
	#
	#	m is a positive integer input variable set to the number
	#	  of rows of a.
	#
	#	n is a positive integer input variable set to the number
	#	  of columns of a.
	#
	#	a is an m by n array. on input a contains the matrix for
	#	  which the qr factorization is to be computed. on output
	#	  the strict upper trapezoidal part of a contains the strict
	#	  upper trapezoidal part of r, and the lower trapezoidal
	#	  part of a contains a factored form of q (the non-trivial
	#	  elements of the u vectors described above).
	#
	#	lda is a positive integer input variable not less than m
	#	  which specifies the leading dimension of the array a.
	#
	#	pivot is a logical input variable. if pivot is set true,
	#	  then column pivoting is enforced. if pivot is set false,
	#	  then no column pivoting is done.
	#
	#	ipvt is an integer output array of length lipvt. ipvt
	#	  defines the permutation matrix p such that a*p = q*r.
	#	  column j of p is column ipvt(j) of the identity matrix.
	#	  if pivot is false, ipvt is not referenced.
	#
	#	lipvt is a positive integer input variable. if pivot is false,
	#	  then lipvt may be as small as 1. if pivot is true, then
	#	  lipvt must be at least n.
	#
	#	rdiag is an output array of length n which contains the
	#	  diagonal elements of r.
	#
	#	acnorm is an output array of length n which contains the
	#	  norms of the corresponding columns of the input matrix a.
	#	  if this information is not needed, then acnorm can coincide
	#	  with rdiag.
	#
	#	wa is a work array of length n. if pivot is false, then wa
	#	  can coincide with rdiag.
	#
	#	 subprograms called
	#
	#	minpack-supplied ... dpmpar,enorm
	#
	#	fortran-supplied ... dmax1,dsqrt,min0
	#
	#	 argonne national laboratory. minpack project. march 1980.
	#	 burton s. garbow, kenneth e. hillstrom, jorge j. more
	#
	#	 **********
	#
	# PIVOTING / PERMUTING:
	#
	# Upon return, A(*,*) is in standard parameter order, A(*,IPVT) is in
	# permuted order.
	# 
	# RDIAG is in permuted order.
	# ACNORM is in standard parameter order.
	#
	#
	# NOTE: in IDL the factors appear slightly differently than described
	# above.  The matrix A is still m x n where m >= n.
	#
	# The "upper" triangular matrix R is actually stored in the strict
	# lower left triangle of A under the standard notation of IDL.
	#
	# The reflectors that generate Q are in the upper trapezoid of A upon
	# output.
	#
	#  EXAMPLE:  decompose the matrix [[9.,2.,6.],[4.,8.,7.]]
	#	aa = [[9.,2.,6.],[4.,8.,7.]]
	#	mpfit_qrfac, aa, aapvt, rdiag, aanorm
	#	 IDL> print, aa
	#		  1.81818*	 0.181818*	 0.545455*
	#		 -8.54545+	  1.90160*	 0.432573*
	#	 IDL> print, rdiag
	#		 -11.0000+	 -7.48166+
	#
	# The components marked with a * are the components of the
	# reflectors, and those marked with a + are components of R.
	#
	# To reconstruct Q and R we proceed as follows.  First R.
	#	r = fltarr(m, n)
	#	for i = 0, n-1 do r(0:i,i) = aa(0:i,i)  # fill in lower diag
	#	r(lindgen(n)*(m+1)) = rdiag
	#
	# Next, Q, which are composed from the reflectors.  Each reflector v
	# is taken from the upper trapezoid of aa, and converted to a matrix
	# via (I - 2 vT . v / (v . vT)).
	#
	#   hh = ident									# identity matrix
	#   for i = 0, n-1 do begin
	#	v = aa(*,i) & if i GT 0 then v(0:i-1) = 0	# extract reflector
	#	hh = hh # (ident - 2*(v # v)/total(v * v))  # generate matrix
	#   endfor
	#
	# Test the result:
	#	IDL> print, hh # transpose(r)
	#		  9.00000	  4.00000
	#		  2.00000	  8.00000
	#		  6.00000	  7.00000
	#
	# Note that it is usually never necessary to form the Q matrix
	# explicitly, and MPFIT does not.
	

	def qrfac(self, a, pivot=0):

		if self.debug: print ('Entering qrfac...')
		machep = self.machar.machep
		sz = a.shape
		m = sz[0]
		n = sz[1]

		# Compute the initial column norms and initialize arrays
		acnorm = numpy.zeros(n, dtype=float)
		for j in range(n):
			acnorm[j] = self.enorm(a[:,j])
		rdiag = acnorm.copy()
		wa = rdiag.copy()
		ipvt = numpy.arange(n)

		# Reduce a to r with householder transformations
		minmn = numpy.min([m,n])
		for j in range(minmn):
			if pivot != 0:
				# Bring the column of largest norm into the pivot position
				rmax = numpy.max(rdiag[j:])
				kmax = (numpy.nonzero(rdiag[j:] == rmax))[0]
				ct = len(kmax)
				kmax = kmax + j
				if ct > 0:
					kmax = kmax[0]

					# Exchange rows via the pivot only.  Avoid actually exchanging
					# the rows, in case there is lots of memory transfer.  The
					# exchange occurs later, within the body of MPFIT, after the
					# extraneous columns of the matrix have been shed.
					if kmax != j:
						temp = ipvt[j] ; ipvt[j] = ipvt[kmax] ; ipvt[kmax] = temp
						rdiag[kmax] = rdiag[j]
						wa[kmax] = wa[j]

			# Compute the householder transformation to reduce the jth
			# column of A to a multiple of the jth unit vector
			lj = ipvt[j]
			ajj = a[j:,lj]
			ajnorm = self.enorm(ajj)
			if ajnorm == 0:
				break
			if a[j,lj] < 0:
				ajnorm = -ajnorm

			ajj = ajj / ajnorm
			ajj[0] = ajj[0] + 1
			# *** Note optimization a(j:*,j)
			a[j:,lj] = ajj

			# Apply the transformation to the remaining columns
			# and update the norms

			# NOTE to SELF: tried to optimize this by removing the loop,
			# but it actually got slower.  Reverted to "for" loop to keep
			# it simple.
			if j+1 < n:
				for k in range(j+1, n):
					lk = ipvt[k]
					ajk = a[j:,lk]
					# *** Note optimization a(j:*,lk)
					# (corrected 20 Jul 2000)
					if a[j,lj] != 0:
						a[j:,lk] = ajk - ajj * sum(ajk*ajj)/a[j,lj]
						if (pivot != 0) and (rdiag[k] != 0):
							temp = a[j,lk]/rdiag[k]
							rdiag[k] = rdiag[k] * numpy.sqrt(numpy.max([(1.-temp**2), 0.]))
							temp = rdiag[k]/wa[k]
							if (0.05*temp*temp) <= machep:
								rdiag[k] = self.enorm(a[j+1:,lk])
								wa[k] = rdiag[k]
			rdiag[j] = -ajnorm
		return [a, ipvt, rdiag, acnorm]

	
	#	 Original FORTRAN documentation
	#	 **********
	#
	#	 subroutine qrsolv
	#
	#	 given an m by n matrix a, an n by n diagonal matrix d,
	#	 and an m-vector b, the problem is to determine an x which
	#	 solves the system
	#
	#		   a*x = b ,	 d*x = 0 ,
	#
	#	 in the least squares sense.
	#
	#	 this subroutine completes the solution of the problem
	#	 if it is provided with the necessary information from the
	#	 factorization, with column pivoting, of a. that is, if
	#	 a*p = q*r, where p is a permutation matrix, q has orthogonal
	#	 columns, and r is an upper triangular matrix with diagonal
	#	 elements of nonincreasing magnitude, then qrsolv expects
	#	 the full upper triangle of r, the permutation matrix p,
	#	 and the first n components of (q transpose)*b. the system
	#	 a*x = b, d*x = 0, is then equivalent to
	#
	#				  t	   t
	#		   r*z = q *b ,  p *d*p*z = 0 ,
	#
	#	 where x = p*z. if this system does not have full rank,
	#	 then a least squares solution is obtained. on output qrsolv
	#	 also provides an upper triangular matrix s such that
	#
	#			t   t			   t
	#		   p *(a *a + d*d)*p = s *s .
	#
	#	 s is computed within qrsolv and may be of separate interest.
	#
	#	 the subroutine statement is
	#
	#	   subroutine qrsolv(n,r,ldr,ipvt,diag,qtb,x,sdiag,wa)
	#
	#	 where
	#
	#	   n is a positive integer input variable set to the order of r.
	#
	#	   r is an n by n array. on input the full upper triangle
	#		 must contain the full upper triangle of the matrix r.
	#		 on output the full upper triangle is unaltered, and the
	#		 strict lower triangle contains the strict upper triangle
	#		 (transposed) of the upper triangular matrix s.
	#
	#	   ldr is a positive integer input variable not less than n
	#		 which specifies the leading dimension of the array r.
	#
	#	   ipvt is an integer input array of length n which defines the
	#		 permutation matrix p such that a*p = q*r. column j of p
	#		 is column ipvt(j) of the identity matrix.
	#
	#	   diag is an input array of length n which must contain the
	#		 diagonal elements of the matrix d.
	#
	#	   qtb is an input array of length n which must contain the first
	#		 n elements of the vector (q transpose)*b.
	#
	#	   x is an output array of length n which contains the least
	#		 squares solution of the system a*x = b, d*x = 0.
	#
	#	   sdiag is an output array of length n which contains the
	#		 diagonal elements of the upper triangular matrix s.
	#
	#	   wa is a work array of length n.
	#
	#	 subprograms called
	#
	#	   fortran-supplied ... dabs,dsqrt
	#
	#	 argonne national laboratory. minpack project. march 1980.
	#	 burton s. garbow, kenneth e. hillstrom, jorge j. more
	#
	
	def qrsolv(self, r, ipvt, diag, qtb, sdiag):
		if self.debug:
			print ('Entering qrsolv...')
		sz = r.shape
		m = sz[0]
		n = sz[1]

		# copy r and (q transpose)*b to preserve input and initialize s.
		# in particular, save the diagonal elements of r in x.

		for j in range(n):
			r[j:n,j] = r[j,j:n]
		x = numpy.diagonal(r).copy()
		wa = qtb.copy()

		# Eliminate the diagonal matrix d using a givens rotation
		for j in range(n):
			l = ipvt[j]
			if diag[l] == 0:
				break
			sdiag[j:] = 0
			sdiag[j] = diag[l]

			# The transformations to eliminate the row of d modify only a
			# single element of (q transpose)*b beyond the first n, which
			# is initially zero.

			qtbpj = 0.
			for k in range(j,n):
				if sdiag[k] == 0:
					break
				if numpy.abs(r[k,k]) < numpy.abs(sdiag[k]):
					cotan  = r[k,k]/sdiag[k]
					sine   = 0.5/numpy.sqrt(.25 + .25*cotan*cotan)
					cosine = sine*cotan
				else:
					tang   = sdiag[k]/r[k,k]
					cosine = 0.5/numpy.sqrt(.25 + .25*tang*tang)
					sine   = cosine*tang

				# Compute the modified diagonal element of r and the
				# modified element of ((q transpose)*b,0).
				r[k,k] = cosine*r[k,k] + sine*sdiag[k]
				temp = cosine*wa[k] + sine*qtbpj
				qtbpj = -sine*wa[k] + cosine*qtbpj
				wa[k] = temp

				# Accumulate the transformation in the row of s
				if n > k+1:
					temp = cosine*r[k+1:n,k] + sine*sdiag[k+1:n]
					sdiag[k+1:n] = -sine*r[k+1:n,k] + cosine*sdiag[k+1:n]
					r[k+1:n,k] = temp
			sdiag[j] = r[j,j]
			r[j,j] = x[j]

		# Solve the triangular system for z.  If the system is singular
		# then obtain a least squares solution
		nsing = n
		wh = (numpy.nonzero(sdiag == 0))[0]
		if len(wh) > 0:
			nsing = wh[0]
			wa[nsing:] = 0

		if nsing >= 1:
			wa[nsing-1] = wa[nsing-1]/sdiag[nsing-1] # Degenerate case
			# *** Reverse loop ***
			for j in range(nsing-2,-1,-1):
				sum0 = sum(r[j+1:nsing,j]*wa[j+1:nsing])
				wa[j] = (wa[j]-sum0)/sdiag[j]

		# Permute the components of z back to components of x
		x[ipvt] = wa
		return (r, x, sdiag)



	
	#	 Original FORTRAN documentation
	#
	#	 subroutine lmpar
	#
	#	 given an m by n matrix a, an n by n nonsingular diagonal
	#	 matrix d, an m-vector b, and a positive number delta,
	#	 the problem is to determine a value for the parameter
	#	 par such that if x solves the system
	#
	#		a*x = b ,	 sqrt(par)*d*x = 0 ,
	#
	#	 in the least squares sense, and dxnorm is the euclidean
	#	 norm of d*x, then either par is zero and
	#
	#		(dxnorm-delta) .le. 0.1*delta ,
	#
	#	 or par is positive and
	#
	#		abs(dxnorm-delta) .le. 0.1*delta .
	#
	#	 this subroutine completes the solution of the problem
	#	 if it is provided with the necessary information from the
	#	 qr factorization, with column pivoting, of a. that is, if
	#	 a*p = q*r, where p is a permutation matrix, q has orthogonal
	#	 columns, and r is an upper triangular matrix with diagonal
	#	 elements of nonincreasing magnitude, then lmpar expects
	#	 the full upper triangle of r, the permutation matrix p,
	#	 and the first n components of (q transpose)*b. on output
	#	 lmpar also provides an upper triangular matrix s such that
	#
	#		 t   t				   t
	#		p *(a *a + par*d*d)*p = s *s .
	#
	#	 s is employed within lmpar and may be of separate interest.
	#
	#	 only a few iterations are generally needed for convergence
	#	 of the algorithm. if, however, the limit of 10 iterations
	#	 is reached, then the output par will contain the best
	#	 value obtained so far.
	#
	#	 the subroutine statement is
	#
	#	subroutine lmpar(n,r,ldr,ipvt,diag,qtb,delta,par,x,sdiag,
	#					 wa1,wa2)
	#
	#	 where
	#
	#	n is a positive integer input variable set to the order of r.
	#
	#	r is an n by n array. on input the full upper triangle
	#	  must contain the full upper triangle of the matrix r.
	#	  on output the full upper triangle is unaltered, and the
	#	  strict lower triangle contains the strict upper triangle
	#	  (transposed) of the upper triangular matrix s.
	#
	#	ldr is a positive integer input variable not less than n
	#	  which specifies the leading dimension of the array r.
	#
	#	ipvt is an integer input array of length n which defines the
	#	  permutation matrix p such that a*p = q*r. column j of p
	#	  is column ipvt(j) of the identity matrix.
	#
	#	diag is an input array of length n which must contain the
	#	  diagonal elements of the matrix d.
	#
	#	qtb is an input array of length n which must contain the first
	#	  n elements of the vector (q transpose)*b.
	#
	#	delta is a positive input variable which specifies an upper
	#	  bound on the euclidean norm of d*x.
	#
	#	par is a nonnegative variable. on input par contains an
	#	  initial estimate of the levenberg-marquardt parameter.
	#	  on output par contains the final estimate.
	#
	#	x is an output array of length n which contains the least
	#	  squares solution of the system a*x = b, sqrt(par)*d*x = 0,
	#	  for the output par.
	#
	#	sdiag is an output array of length n which contains the
	#	  diagonal elements of the upper triangular matrix s.
	#
	#	wa1 and wa2 are work arrays of length n.
	#
	#	 subprograms called
	#
	#	minpack-supplied ... dpmpar,enorm,qrsolv
	#
	#	fortran-supplied ... dabs,dmax1,dmin1,dsqrt
	#
	#	 argonne national laboratory. minpack project. march 1980.
	#	 burton s. garbow, kenneth e. hillstrom, jorge j. more
	#
	
	def lmpar(self, r, ipvt, diag, qtb, delta, x, sdiag, par=None):

		if self.debug:
			print ('Entering lmpar...')
		dwarf = self.machar.minnum
		machep = self.machar.machep
		sz = r.shape
		m = sz[0]
		n = sz[1]

		# Compute and store in x the gauss-newton direction.  If the
		# jacobian is rank-deficient, obtain a least-squares solution
		nsing = n
		wa1 = qtb.copy()
		rthresh = numpy.max(numpy.abs(numpy.diagonal(r))) * machep
		wh = (numpy.nonzero(numpy.abs(numpy.diagonal(r)) < rthresh))[0]
		if len(wh) > 0:
			nsing = wh[0]
			wa1[wh[0]:] = 0
		if nsing >= 1:
			# *** Reverse loop ***
			for j in range(nsing-1,-1,-1):
				wa1[j] = wa1[j]/r[j,j]
				if j-1 >= 0:
					wa1[0:j] = wa1[0:j] - r[0:j,j]*wa1[j]

		# Note: ipvt here is a permutation array
		x[ipvt] = wa1

		# Initialize the iteration counter.  Evaluate the function at the
		# origin, and test for acceptance of the gauss-newton direction
		iter = 0
		wa2 = diag * x
		dxnorm = self.enorm(wa2)
		fp = dxnorm - delta
		if fp <= 0.1*delta:
			return [r, 0., x, sdiag]

		# If the jacobian is not rank deficient, the newton step provides a
		# lower bound, parl, for the zero of the function.  Otherwise set
		# this bound to zero.

		parl = 0.
		if nsing >= n:
			wa1 = diag[ipvt] * wa2[ipvt] / dxnorm
			wa1[0] = wa1[0] / r[0,0] # Degenerate case
			for j in range(1,n):   # Note "1" here, not zero
				sum0 = sum(r[0:j,j]*wa1[0:j])
				wa1[j] = (wa1[j] - sum0)/r[j,j]

			temp = self.enorm(wa1)
			parl = ((fp/delta)/temp)/temp

		# Calculate an upper bound, paru, for the zero of the function
		for j in range(n):
			sum0 = sum(r[0:j+1,j]*qtb[0:j+1])
			wa1[j] = sum0/diag[ipvt[j]]
		gnorm = self.enorm(wa1)
		paru = gnorm/delta
		if paru == 0:
			paru = dwarf/numpy.min([delta,0.1])

		# If the input par lies outside of the interval (parl,paru), set
		# par to the closer endpoint

		par = numpy.max([par,parl])
		par = numpy.min([par,paru])
		if par == 0:
			par = gnorm/dxnorm

		# Beginning of an interation
		while(1):
			iter = iter + 1

			# Evaluate the function at the current value of par
			if par == 0:
				par = numpy.max([dwarf, paru*0.001])
			temp = numpy.sqrt(par)
			wa1 = temp * diag
			[r, x, sdiag] = self.qrsolv(r, ipvt, wa1, qtb, sdiag)
			wa2 = diag*x
			dxnorm = self.enorm(wa2)
			temp = fp
			fp = dxnorm - delta

			if (numpy.abs(fp) <= 0.1*delta) or \
			   ((parl == 0) and (fp <= temp) and (temp < 0)) or \
			   (iter == 10):
			   break;

			# Compute the newton correction
			wa1 = diag[ipvt] * wa2[ipvt] / dxnorm

			for j in range(n-1):
				wa1[j] = wa1[j]/sdiag[j]
				wa1[j+1:n] = wa1[j+1:n] - r[j+1:n,j]*wa1[j]
			wa1[n-1] = wa1[n-1]/sdiag[n-1] # Degenerate case

			temp = self.enorm(wa1)
			parc = ((fp/delta)/temp)/temp

			# Depending on the sign of the function, update parl or paru
			if fp > 0:
				parl = numpy.max([parl,par])
			if fp < 0:
				paru = numpy.min([paru,par])

			# Compute an improved estimate for par
			par = numpy.max([parl, par+parc])

			# End of an iteration

		# Termination
		return [r, par, x, sdiag]

	
	# Procedure to tie one parameter to another.
	def tie(self, p, ptied=None):
		if self.debug:
			print ('Entering tie...')
		if ptied is None:
			return
		for i in range(len(ptied)):
			if ptied[i] == '':
				continue
			cmd = 'p[' + str(i) + '] = ' + ptied[i]
			exec(cmd)
		return p

	
	#	 Original FORTRAN documentation
	#	 **********
	#
	#	 subroutine covar
	#
	#	 given an m by n matrix a, the problem is to determine
	#	 the covariance matrix corresponding to a, defined as
	#
	#					t
	#		   inverse(a *a) .
	#
	#	 this subroutine completes the solution of the problem
	#	 if it is provided with the necessary information from the
	#	 qr factorization, with column pivoting, of a. that is, if
	#	 a*p = q*r, where p is a permutation matrix, q has orthogonal
	#	 columns, and r is an upper triangular matrix with diagonal
	#	 elements of nonincreasing magnitude, then covar expects
	#	 the full upper triangle of r and the permutation matrix p.
	#	 the covariance matrix is then computed as
	#
	#					  t	 t
	#		   p*inverse(r *r)*p  .
	#
	#	 if a is nearly rank deficient, it may be desirable to compute
	#	 the covariance matrix corresponding to the linearly independent
	#	 columns of a. to define the numerical rank of a, covar uses
	#	 the tolerance tol. if l is the largest integer such that
	#
	#		   abs(r(l,l)) .gt. tol*abs(r(1,1)) ,
	#
	#	 then covar computes the covariance matrix corresponding to
	#	 the first l columns of r. for k greater than l, column
	#	 and row ipvt(k) of the covariance matrix are set to zero.
	#
	#	 the subroutine statement is
	#
	#	   subroutine covar(n,r,ldr,ipvt,tol,wa)
	#
	#	 where
	#
	#	   n is a positive integer input variable set to the order of r.
	#
	#	   r is an n by n array. on input the full upper triangle must
	#		 contain the full upper triangle of the matrix r. on output
	#		 r contains the square symmetric covariance matrix.
	#
	#	   ldr is a positive integer input variable not less than n
	#		 which specifies the leading dimension of the array r.
	#
	#	   ipvt is an integer input array of length n which defines the
	#		 permutation matrix p such that a*p = q*r. column j of p
	#		 is column ipvt(j) of the identity matrix.
	#
	#	   tol is a nonnegative input variable used to define the
	#		 numerical rank of a in the manner described above.
	#
	#	   wa is a work array of length n.
	#
	#	 subprograms called
	#
	#	   fortran-supplied ... dabs
	#
	#	 argonne national laboratory. minpack project. august 1980.
	#	 burton s. garbow, kenneth e. hillstrom, jorge j. more
	#
	#	 **********
	
	def calc_covar(self, rr, ipvt=None, tol=1.e-14):

		if self.debug:
			print ('Entering calc_covar...')
		if numpy.rank(rr) != 2:
			print ('ERROR: r must be a two-dimensional matrix')
			return -1
		s = rr.shape
		n = s[0]
		if s[0] != s[1]:
			print ('ERROR: r must be a square matrix')
			return -1

		if ipvt is None:
			ipvt = numpy.arange(n)
		r = rr.copy()
		r.shape = [n,n]

		# For the inverse of r in the full upper triangle of r
		l = -1
		tolr = tol * numpy.abs(r[0,0])
		for k in range(n):
			if numpy.abs(r[k,k]) <= tolr:
				break
			r[k,k] = 1./r[k,k]
			for j in range(k):
				temp = r[k,k] * r[j,k]
				r[j,k] = 0.
				r[0:j+1,k] = r[0:j+1,k] - temp*r[0:j+1,j]
			l = k

		# Form the full upper triangle of the inverse of (r transpose)*r
		# in the full upper triangle of r
		if l >= 0:
			for k in range(l+1):
				for j in range(k):
					temp = r[j,k]
					r[0:j+1,j] = r[0:j+1,j] + temp*r[0:j+1,k]
				temp = r[k,k]
				r[0:k+1,k] = temp * r[0:k+1,k]

		# For the full lower triangle of the covariance matrix
		# in the strict lower triangle or and in wa
		wa = numpy.repeat([r[0,0]], n)
		for j in range(n):
			jj = ipvt[j]
			sing = j > l
			for i in range(j+1):
				if sing:
					r[i,j] = 0.
				ii = ipvt[i]
				if ii > jj:
					r[ii,jj] = r[i,j]
				if ii < jj:
					r[jj,ii] = r[i,j]
			wa[jj] = r[j,j]

		# Symmetrize the covariance matrix in r
		for j in range(n):
			r[0:j+1,j] = r[j,0:j+1]
			r[j,j] = wa[j]

		return r


class machar:
	def __init__(self, double=1):
		if double == 0:
			info = numpy.finfo(numpy.float32)
		else:
			info = numpy.finfo(numpy.float64)

		self.machep = info.eps
		self.maxnum = info.max
		self.minnum = info.tiny

		self.maxlog = numpy.log(self.maxnum)
		self.minlog = numpy.log(self.minnum)
		self.rdwarf = numpy.sqrt(self.minnum*1.5) * 10
		self.rgiant = numpy.sqrt(self.maxnum) * 0.1

