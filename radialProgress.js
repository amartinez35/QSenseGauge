/**
 Copyright (c) 2014 BrightPoint Consulting, Inc.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */
function radialProgress(parent, width, height, colors, image, labelOK) {
  var colors = colors;
  var _data = null,
    _duration = 1000,
    _selection,
    _margin = {
      top: 0,
      right: 0,
      bottom: 30,
      left: 0
    },
    __width = width,
    __height = height,
    _diameter = Math.min(width, height), //150,
    _minDiam = _diameter,
    _label = "",
		_label2 = "",
    _fontSize = 8;


  var _mouseClick;

  var _value = 0,
    _value2 = 0,
    _minValue = 0,
    _maxValue = 100,
	  _maxValue2 = 100;

  var _currentArc = 0,
    _currentArc2 = 0,
    _currentValue = 0,
	  _angle=360,
	  _radians=180;

  var _arc = d3.svg.arc()
    .startAngle(0 * (Math.PI / _radians)); //just radians

  var _arc2 = d3.svg.arc()
    .startAngle(0 * (Math.PI / _radians))
    .endAngle(0); //just radians


  _selection = d3.select(parent);


  function component() {

    _selection.each(function(data) {

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      var enter = svg.enter().append("svg").attr("class", "radial-svg").append("g");

      measure();

      svg.attr("width", __width)
        .attr("height", __height);


      var background = enter.append("g").attr("class", "component");
      //.attr("cursor","pointer")
      //.on("click",onMouseClick);


      _arc.endAngle(_angle * (Math.PI / _radians))
      _arc2.endAngle(_angle * (Math.PI / _radians))
	

      background.append("rect")
        .attr("class", "background")
        .attr("width", _width)
        .attr("height", _height)
			  .attr("y", 0)
			  .attr("x", 0);

      background.append("path")
        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
        .attr("d", _arc)
			  .attr("opacity", 0)
			  .attr("y", 0)
			  .attr("x", 0);
      background.append("path")
        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
        .attr("d", _arc2)
			  .attr("opacity", 0)
				.attr("y", 0)
			  .attr("x", 0);

      var g = svg.select("g")
        .attr("transform", "translate(" + 0 /*_margin.left*/ + "," + 0 /*_margin.top*/ + ")");

      _arc.endAngle(_currentArc);
      enter.append("g").attr("class", "arcs");
      var path = svg.select(".arcs").selectAll(".arc").data(data);
      path.enter().append("path")
        .attr("class", "arc")
        .attr("fill", colors[0])
        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
        .attr("d", _arc);
			
      //Another path in case we exceed 100%
      var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
      path2.enter().append("path")
        .attr("class", "arc2")
        .attr("fill", colors[1])
        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
        .attr("d", _arc2);

      enter.append("g").attr("class", "labels");
      var label = svg.select(".labels").selectAll(".label").data(data);
      label.enter().append("image")
        .attr("class", "label")
        .attr("y", _height / 2)
        .attr("x", _height / 2.7)
        .attr("width", _width / 4)
        .attr("height", _height / 4)
        .attr("xlink:href", image);

			console.log(labelOK[0]);
			
			if(labelOK[0]){ 
			  label.enter().append("text")
          .attr("class", "label")
          .attr("y", _height / 3)
          .attr("x", _height / 2)
          .attr("width", _width)
          .attr("fill", colors[0])
          .text(function(d) {
            return _label;
          })
          .style("font-size", _fontSize / 2 + "px");
			}


      if (_value2 != 0 && labelOK[1]) {
        label.enter().append("text")
          .attr("class", "label")
          .attr("y", _height / 2.5)
          .attr("x", _height / 2)
          .attr("width", _width)
          .attr("fill", colors[1])
          //.attr("x",(3*_fontSize/2))
          .text(function(d) {
            return _label2;
          })
          .style("font-size", _fontSize / 2 + "px");
      }
      path.exit().transition().duration(500).attr("x", 1000).remove();


      layout(svg);

      function layout(svg) {

        var ratio = (_value - _minValue) / (_maxValue - _minValue);
        var endAngle = Math.min(_angle * ratio, _angle);
        endAngle = endAngle * Math.PI / _radians;

        path.datum(endAngle);
        path.transition().duration(_duration)
          .attrTween("d", arcTween);

        if (_value2 !== 0) {
          ratio = (_value2 - _minValue) / (_maxValue2 - _minValue);
          endAngle = Math.min(_angle * ratio, _angle);
          endAngle = endAngle * Math.PI / _radians;
          path2.datum(endAngle);
          path2.transition().duration(_duration)
            .attrTween("d", arcTween2);

        } else if (ratio > 1) {

          path2.datum(Math.min(_angle * (ratio - 1), _angle) * Math.PI / _radians);
          path2.transition().delay(_duration).duration(_duration)
            .attrTween("d", arcTween2);

        }


        label.datum(Math.round(ratio * 100));
        //label.transition().duration(_duration)
        // .tween("text",labelTween);
      }

    });

    function onMouseClick(d) {
      if (typeof _mouseClick == "function") {
        _mouseClick.call();
      }
    }
  }

  function labelTween(a) {
    var i = d3.interpolate(_currentValue, a);
    _currentValue = i(0);

    return function(t) {
      _currentValue = i(t);
      this.textContent = Math.round(i(t)) + "%";
    }
  }

  function arcTween(a) {
    var i = d3.interpolate(_currentArc, a);

    return function(t) {
      _currentArc = i(t);
      return _arc.endAngle(i(t))();
    };
  }

  function arcTween2(a) {
    var i = d3.interpolate(_currentArc2, a);

    return function(t) {
      return _arc2.endAngle(i(t))();
    };
  }


  function measure() {
    _width = _diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
    _height = _width;
    _fontSize = _width * .1;
    _arc.outerRadius(_width / 2);
    _arc.innerRadius(_width / 2 * .85);
    _arc2.outerRadius(_width / 2 * .85);
    _arc2.innerRadius(_width / 2 * .85 - (_width / 2 * .15));
  }


  component.render = function() {
    measure();
    component();
    return component;
  }

  component.value = function(_) {
    if (!arguments.length) return _value;
    _value = [_];
    _selection.datum([_value]);
    return component;
  }

  component.value2 = function(_) {
    if (!arguments.length) return _value2;
    _value2 = [_];
    _selection.datum([_value2]);
    return component;
  }


  component.margin = function(_) {
    if (!arguments.length) return _margin;
    _margin = _;
    return component;
  };

  component.diameter = function(_) {
    if (!arguments.length) return _diameter
    _diameter = _;
    return component;
  };

  component.minValue = function(_) {
    if (!arguments.length) return _minValue;
    _minValue = _;
    return component;
  };

  component.maxValue = function(_) {
    if (!arguments.length) return _maxValue;
    _maxValue = _;
    return component;
  };
	component.maxValue2 = function(_) {
    if (!arguments.length) return _maxValue2;
    _maxValue2 = _;
    return component;
  };

  component.label = function(_) {
    if (!arguments.length) return _label;
    _label = _;
    return component;
  };
	component.label2 = function(_) {
    if (!arguments.length) return _label2;
    _label2 = _;
    return component;
  };

  component._duration = function(_) {
    if (!arguments.length) return _duration;
    _duration = _;
    return component;
  };

  component.onClick = function(_) {
    if (!arguments.length) return _mouseClick;
    _mouseClick = _;
    return component;
  }

  return component;

}
