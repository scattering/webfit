/**
 * @class Ext.resizer.SplitterTracker
 * @extends Ext.dd.DragTracker
 * Private utility class for Ext.Splitter.
 * @private
 */
Ext.define('Ext.resizer.SplitterTracker', {
    extend: 'Ext.dd.DragTracker',
    requires: ['Ext.util.Region'],
    enabled: true,
    
    overlayCls: Ext.baseCSSPrefix + 'resizable-overlay',

    getPrevCmp: function() {
        var splitter = this.getSplitter();
        return splitter.previousSibling();
    },

    getNextCmp: function() {
        var splitter = this.getSplitter();
        return splitter.nextSibling();
    },

    // ensure the tracker is enabled, store boxes of previous and next
    // components and calculate the constrain region
    onBeforeStart: function(e) {
        var me = this,
            prevCmp = me.getPrevCmp(),
            nextCmp = me.getNextCmp();

        // SplitterTracker is disabled if any of its adjacents are collapsed.
        if (nextCmp.collapsed || prevCmp.collapsed) {
            return false;
        }
        // store boxes of previous and next
        me.prevBox  = prevCmp.getEl().getBox();
        me.nextBox  = nextCmp.getEl().getBox();
        me.constrainTo = me.calculateConstrainRegion();
    },

    // We move the splitter el. Add the proxy class.
    onStart: function(e) {
        var splitter = this.getSplitter(),
            overlay;
            
        splitter.addCls(splitter.baseCls + '-active');
        overlay = this.overlay =  Ext.getBody().createChild({
            cls: this.overlayCls, 
            html: '&#160;'
        });
        overlay.unselectable();
        overlay.setSize(Ext.core.Element.getViewWidth(true), Ext.core.Element.getViewHeight(true));
        overlay.show();
    },

    // calculate the constrain Region in which the splitter el may be moved.
    calculateConstrainRegion: function() {
        var me         = this,
            splitter   = me.getSplitter(),
            splitWidth = splitter.getWidth(),
            defaultMin = splitter.defaultSplitMin,
            orient     = splitter.orientation,
            prevBox    = me.prevBox,
            prevCmp    = me.getPrevCmp(),
            nextBox    = me.nextBox,
            nextCmp    = me.getNextCmp(),
            // prev and nextConstrainRegions are the maximumBoxes minus the
            // minimumBoxes. The result is always the intersection
            // of these two boxes.
            prevConstrainRegion, nextConstrainRegion;

        // vertical splitters, so resizing left to right
        if (orient === 'vertical') {

            // Region constructor accepts (top, right, bottom, left)
            // anchored/calculated from the left
            prevConstrainRegion = Ext.create('Ext.util.Region',
                prevBox.y,
                // Right boundary is x + maxWidth if there IS a maxWidth.
                // Otherwise it is calculated based upon the minWidth of the next Component
                (prevCmp.maxWidth ? prevBox.x + prevCmp.maxWidth : nextBox.right - (nextCmp.minWidth || defaultMin)) + splitWidth,
                prevBox.bottom,
                prevBox.x + (prevCmp.minWidth || defaultMin)
            );
            // anchored/calculated from the right
            nextConstrainRegion = Ext.create('Ext.util.Region',
                nextBox.y,
                nextBox.right - (nextCmp.minWidth || defaultMin),
                nextBox.bottom,
                // Left boundary is right - maxWidth if there IS a maxWidth.
                // Otherwise it is calculated based upon the minWidth of the previous Component
                (nextCmp.maxWidth ? nextBox.right - nextCmp.maxWidth : prevBox.x + (prevBox.minWidth || defaultMin)) - splitWidth
            );
        } else {
            // anchored/calculated from the top
            prevConstrainRegion = Ext.create('Ext.util.Region',
                prevBox.y + (prevCmp.minHeight || defaultMin),
                prevBox.right,
                // Bottom boundary is y + maxHeight if there IS a maxHeight.
                // Otherwise it is calculated based upon the minWidth of the next Component
                (prevCmp.maxHeight ? prevBox.y + prevCmp.maxHeight : nextBox.bottom - (nextCmp.minHeight || defaultMin)) + splitWidth,
                prevBox.x
            );
            // anchored/calculated from the bottom
            nextConstrainRegion = Ext.create('Ext.util.Region',
                // Top boundary is bottom - maxHeight if there IS a maxHeight.
                // Otherwise it is calculated based upon the minHeight of the previous Component
                (nextCmp.maxHeight ? nextBox.bottom - nextCmp.maxHeight : prevBox.y + (prevCmp.minHeight || defaultMin)) - splitWidth,
                nextBox.right,
                nextBox.bottom - (nextCmp.minHeight || defaultMin),
                nextBox.x
            );
        }

        // intersection of the two regions to provide region draggable
        return prevConstrainRegion.intersect(nextConstrainRegion);
    },

    // Performs the actual resizing of the previous and next components
    performResize: function(e) {
        var me       = this,
            offset   = me.getOffset('dragTarget'),
            splitter = me.getSplitter(),
            orient   = splitter.orientation,
            prevCmp  = me.getPrevCmp(),
            nextCmp  = me.getNextCmp(),
            owner    = splitter.ownerCt,
            layout   = owner.getLayout();

        // Inhibit automatic container layout caused by setSize calls below.
        owner.suspendLayout = true;

        if (orient === 'vertical') {
            if (prevCmp) {
                if (!prevCmp.maintainFlex) {
                    delete prevCmp.flex;
                    prevCmp.setSize(me.prevBox.width + offset[0], prevCmp.getHeight());
                }
            }
            if (nextCmp) {
                if (!nextCmp.maintainFlex) {
                    delete nextCmp.flex;
                    nextCmp.setSize(me.nextBox.width - offset[0], nextCmp.getHeight());
                }
            }
        // verticals
        } else {
            if (prevCmp) {
                if (!prevCmp.maintainFlex) {
                    delete prevCmp.flex;
                    prevCmp.setSize(prevCmp.getWidth(), me.prevBox.height + offset[1]);
                }
            }
            if (nextCmp) {
                if (!nextCmp.maintainFlex) {
                    delete nextCmp.flex;
                    nextCmp.setSize(prevCmp.getWidth(), me.nextBox.height - offset[1]);
                }
            }
        }
        delete owner.suspendLayout;
        layout.onLayout();
    },

    // perform the resize and remove the proxy class from the splitter el
    onEnd: function(e) {
        var me = this,
            splitter = me.getSplitter();
            
        splitter.removeCls(splitter.baseCls + '-active');
         if (me.overlay) {
             me.overlay.remove();
             delete me.overlay;
        }
        me.performResize();
    },

    // Track the proxy and set the proper XY coordinates
    // while constraining the drag
    onDrag: function(e) {
        var me        = this,
            offset    = me.getOffset('dragTarget'),
            splitter  = me.getSplitter(),
            splitEl   = splitter.getEl(),
            orient    = splitter.orientation;

        if (orient === "vertical") {
            splitEl.setX(me.startRegion.left + offset[0]);
        } else {
            splitEl.setY(me.startRegion.top + offset[1]);
        }
    },

    getSplitter: function() {
        return Ext.getCmp(this.getDragCt().id);
    }
});