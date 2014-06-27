var lmfit = lmfit || {};
$(document).ready(function () {

    /*
            Original FORTRAN documentation
               **********

            subroutine qrsolv

            given an m by n matrix a, an n by n diagonal matrix d,
                and an m-vector b, the problem is to determine an x which
                solves the system

                     a*x = b ,     d*x = 0 ,

            in the least squares sense.

            this subroutine completes the solution of the problem
                if it is provided with the necessary information from the
                factorization, with column pivoting, of a. that is, if
                a*p = q*r, where p is a permutation matrix, q has orthogonal
                columns, and r is an upper triangular matrix with diagonal
                elements of nonincreasing magnitude, then qrsolv expects
                the full upper triangle of r, the permutation matrix p,
                and the first n components of (q transpose)*b. the system
                a*x = b, d*x = 0, is then equivalent to

                                     t        t
                          r*z = q *b ,  p *d*p*z = 0 ,

            where x = p*z. if this system does not have full rank,
                then a least squares solution is obtained. on output qrsolv
                also provides an upper triangular matrix s such that

                           t   t                      t
                          p *(a *a + d*d)*p = s *s .

            s is computed within qrsolv and may be of separate interest.

            the subroutine statement is

            subroutine qrsolv(n,r,ldr,ipvt,diag,qtb,x,sdiag,wa)

            where

              n is a positive integer input variable set to the order of r.

              r is an n by n array. on input the full upper triangle
                        must contain the full upper triangle of the matrix r.
                        on output the full upper triangle is unaltered, and the
                        strict lower triangle contains the strict upper triangle
                        (transposed) of the upper triangular matrix s.

              ldr is a positive integer input variable not less than n
                        which specifies the leading dimension of the array r.

              ipvt is an integer input array of length n which defines the
                        permutation matrix p such that a*p = q*r. column j of p
                        is column ipvt(j) of the identity matrix.

              diag is an input array of length n which must contain the
                        diagonal elements of the matrix d.

              qtb is an input array of length n which must contain the first
                        n elements of the vector (q transpose)*b.

             x is an output array of length n which contains the least
                        squares solution of the system a*x = b, d*x = 0.

             sdiag is an output array of length n which contains the
                        diagonal elements of the upper triangular matrix s.

             wa is a work array of length n.

          subprograms called

              fortran-supplied ... dabs,dsqrt
           argonne national laboratory. minpack project. march 1980.
           burton s. garbow, kenneth e. hillstrom, jorge j. more*/
    lmfit.qrsolv= function(r, ipvt, diag, qtb, sdiag) {
        console.log("entering qrsolv");
        var sz= r.dimensions();
        var m=sz.rows;
        var n=sz.cols;
        for(i=0; i< n; i++)
        {
            for(j=0; j<n;j++)
            {
                r.elements[j][i]= r.elements[i][j];
            }
        }
        var x=Matrix.diagonal(r.diagonal());
        var wa=Matrix.create(qtb.elements);
        for(j=0; j<n; j++)
        {
            var l = ipvt[j];
            if(diag[l] == 0)
            {
                break;
            }
            for(i=j; i<sdiag.length; i++)
            {
                sdiag[i]=0;
            }
            stdiag[j]=diag[l];
            var qtbpj = 0;
            for(k=j; k<n;k++)
            {
                if (sdiag[k]==0)
                {
                    break;
                }
                var cotan, sine, cosine, tang;
                if(Math.abs(r.elements[k][k])<Math.abs(sdiag[k]))
                {
                    cotan= r.elements[k][k]/sdiag[k];
                    sine = 0.5/Math.sqrt(.25 +.25*cotan*cotan);
                    cosine=sine*cotan;
                } else {
                    tang=sdiag[k]/ r.elements[k][k];
                    cosine=0.5/Math.sqrt(.25 +.25*tang*tang);
                    sine= cosine*tang;
                }
                r.elements[k][k]=cosine* r.elements[k][k]+sine*sdiag[k];
                var temp=cosine*wa[k]+sine*qtbpj;
                qtbpj=-sine*wa[k]+cosine*qtbpj;
                wa[k]=temp;
                if(n>k+1)
                {
                    for(i=k+1; i<n;i++)
                    {
                        temp=cosine* r.elements[i][k]+sine*sdiag[i];
                        sdiag[i]=-sine* r.elements[i][k]+cosine*sdiag[i];
                        r.elements[i][k]=temp;
                    }
                }
                sdiag[j]= r.elements[j][j];
                r.elements[j][j]=x[j];

            }



        }
        var nsing=n;
        var wh;
        for(i=0; i<sdiag.length; i++)
        {
            if(sdiag[i]==0)
            {
                wh.push(i);

            }
        }
        if(wh.length>0)
        {
            nsign=wh[0];
            for(i=nsing; i<wa.length;i++)
            {
                wa[i]=0;
            }
        }
        if(nsing>=1)
        {
            wa[nsing-1] = wa[nsing-1]/sdiag[nsing-1];
            for(j=nsing-2; j>-1; j--) {
                var sum0;

                for (k = j + 1; k < nsing; k++) {
                    sum0 += r.elements[k][j]*wa[k];
                }
                wa[j]=(wa[j]-sum0)/sdiag[j];
            }
        }
        x[ipvt]=wa;  //questionable; ipvt is a 1d array, x is a 1d array
        return       //questionable return


    }
    /*             Original FORTRAN documentation
                **********

            subroutine covar

            given an m by n matrix a, the problem is to determine
               the covariance matrix corresponding to a, defined as

                                           t
                          inverse(a *a) .

            this subroutine completes the solution of the problem
                if it is provided with the necessary information from the
                qr factorization, with column pivoting, of a. that is, if
                a*p = q*r, where p is a permutation matrix, q has orthogonal
                columns, and r is an upper triangular matrix with diagonal
                elements of nonincreasing magnitude, then covar expects
                the full upper triangle of r and the permutation matrix p.
                the covariance matrix is then computed as

                                             t      t
                          p*inverse(r *r)*p  .

            if a is nearly rank deficient, it may be desirable to compute
                the covariance matrix corresponding to the linearly independent
                columns of a. to define the numerical rank of a, covar uses
                the tolerance tol. if l is the largest integer such that

                      abs(r(l,l)) .gt. tol*abs(r(1,1)) ,

            then covar computes the covariance matrix corresponding to
                the first l columns of r. for k greater than l, column
                and row ipvt(k) of the covariance matrix are set to zero.

            the subroutine statement is

              subroutine covar(n,r,ldr,ipvt,tol,wa)

            where

              n is a positive integer input variable set to the order of r.

              r is an n by n array. on input the full upper triangle must
                        contain the full upper triangle of the matrix r. on output
                        r contains the square symmetric covariance matrix.

              ldr is a positive integer input variable not less than n
                        which specifies the leading dimension of the array r.

              ipvt is an integer input array of length n which defines the
                        permutation matrix p such that a*p = q*r. column j of p
                        is column ipvt(j) of the identity matrix.

              tol is a nonnegative input variable used to define the
                        numerical rank of a in the manner described above.

              wa is a work array of length n.

            subprograms called

              fortran-supplied ... dabs

            argonne national laboratory. minpack project. august 1980.
                burton s. garbow, kenneth e. hillstrom, jorge j. more

            **********/
    lmfit.calc_covar=function(rr, ipvt, tol){
        console.log("entering calc_covar...");
        if(typeOf(rr.length)=='undefined'||typeOf(rr[0].length)=='undefined')
        {
            console.log("rr not 2d array, calc_covar failed");
            return -1;

        }
        var s=[rr.length, rr[0].length];
        var n=s[0];
        if(s[0]!=s[1])
        {
            console.log("r must be square matrix");
            return -1;
        }
        if(ipvt==typeOf('undefined')){//unsure whether this actually catches a null imput
            for(i=0; i<n; i++)
            {
                ipvt.push(i);
            }
        }
        var r=rr.splice();
        r.shape=[n,n];
        var l=-1;
        if(typeOf(tol)=='undefined')
        {
            tol=1*Math.pow(10, -14);
        }
        var tolr=tol*Math.abs(r[0][0]);
        var temp;
        for(k=0; k<n; k++)
        {
            if(Math.abs(r[k][k])<=tolr)
            {
                break;
            }
            r[k][k]=1/r[k][k];
            for(j=0;j<k;j++)
            {
                temp=r[k][k] * r[j][k];
                r[j][k]=0;
                for(i=0; i<j+1; i++)
                {
                    r[i][j]=r[i][j]-temp*r[i][k];
                }
                temp=r[k][k];
                for(i=0; i<k+1; i++)
                {
                    r[i][k]=temp*r[i][k];
                }
            }
            l=k;

        }
        if(l>=0)
        {
            for(k=0; k<l+1;k++)
            {
                for(j=0;  j<k; j++)
                {
                    temp=r[j][k];
                    for(i=0; i<j+1;i++)
                    {
                        r[i][j]=r[i][j]+temp*r[i][k];
                    }
                    temp=r[k][k];
                    for(i=0; i<k+1;i++)
                    {
                        r[i][k]=temp*r[i][k];
                    }
                }
            }
        }
        var wa;
        for(int i=0; i< n; i++)
        {
            wa.push(r[0][0]);
        }
        for(j=0; j<n; j++)
        {
            var jj= ipvt[j];
            sing= Boolean(j>1);
            for(i=0; i<j+1; i++)
            {
                if (sing)
                {
                    r[i][j]=0
                }
                var ii=ipvt[i];
                if (ii>jj)
                {
                    r[ii][jj]=r[i][j];
                }
                if(ii<jj)
                {
                    r[jj][ii]=r[i][j];
                }
            }
            wa[jj]=r[j][j];

        }
        for(j=0; j<n; j++)
        {
            for(i=0; i<j+1; i++)
            {
                r[i][j]=r[j][i];
                r[j][j]=wa[j];
            }
        }
        return r;
    }

});