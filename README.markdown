# Touch and click based swipable content component

Javascript and jQuery based component for making swipable containers for touch devides and with mouse usage.

# Examples
  
Simple mouse/finger swipable textbox: [http://pulges.github.com/Content-Swipe/](http://pulges.github.com/Content-Swipe/)

#Usage
    
The css variant with inline-blocks and no predefined width works only with no spaces between boxes in html.
It can be used also with float left boxes but then #swipable must have a width that fits all boxes.
    
    <style>
      #swipable-wrap { width: 800px; height: 400px; position: relative; overflow: hidden; }
      #swipeable { position: relative; white-space: nowrap; }
      .swipable-box { width: 800px; height: 400px; display: inline-block; overflow: hidden;}
    </style>
    
    <div id="swipeable">
      <div class="swipable-box">
        ...
      </div><div class="swipable-box">
        ...
      </div><div class="swipable-box">
        ...
      </div>
    </div>

    <script type="text/javascript">
      $('#swipeable').scroller();
    </script>
    
#Configuration
  
    $('#swipeable').scroller({
      box_element: '.swipable-box', // classname of box elements
      move_treshold: 0.15,          // fraction of width needed to drag to trigger scroll to another page
      tap_treshold: 0.05,           // if less than this fraction of width moved, tap event is triggered on scroll box
      fixed_stops: true             // if false autoscroll to closest slide is disabled
    });

#Events

If movement of less than tap treshold occurs. "tap" event is triggered on ".swipable-box"
  
    $('.swipable-box').on('tap', function() { alert('tap'); });
  
After scroll animation finishes "scrollstop" event is triggered on "#swipeable" with index of scroll page position as second parameter

    $('#swipeable').on("scrollstop", function(event, index) {
      alert("Scrolled to index: " + index);
    });
    
#Actions
Example of accessing inner functions

    $('#swipeable').scroller();
    
    // to next slide
    $('#next').click(function() {
      $('#swipeable').scroller().next();
    });
    
    // to prev slide
    $('#prev').click(function() {
      $('#swipeable').scroller().previous();
    });

    // slide to third slide (index 2 as list is 0 based)
    $('#to3').click(function() {
      $('#swipeable').scroller().move_to(2);
    });

    // switch to third slide without animation
    $('#to3_i').click(function() {
      $('#swipeable').scroller().move_to(2, true);
    });
    

NB! Will update the gallery example soon. Current one will not work with new library.
    