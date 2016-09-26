Graph = React.createClass({
  componentDidMount: function() {
    var self = this
    this.attr = {}
    this.attr.svg = d3.select('.Graph').append('svg')
      .attr('width', graphWidth)
      .attr('height', graphHeight)
    this.attr.layer0 = this.attr.svg.append('g')
    this.attr.layer1 = this.attr.svg.append('g')
    this.attr.force = d3.layout.force()
      .size([graphWidth, graphHeight])
      .charge(function(d){
        var sum = 0
        for (var hour in d.count) sum += d.count[hour]
        return sum / -3000
      })
      .linkStrength(function(d){
        var sum = 0
        for (var hour in d.count) sum += d.count[hour]
        return sum / 100000000
      })
    queue(1)
      .defer(requestData, '/pairs')
      .awaitAll(function(error, results) {
        self.attr.nodes = results[0].pairs.nodes
        self.attr.links = results[0].pairs.links
        self.graph()
        self.setState({ created: true })
      })
  },

  componentDidUpdate: function() {
    var self = this
    this.attr.maxSize = this.props.normalize ? 0 : 10000000
    this.attr.maxWeight = this.props.normalize ? 0 : 3000000
    this.attr.svg.selectAll('.node')
      .select('circle')
      .each(function(d){
        if (!self.props.normalize) return
        var sum = 0
        for (var hour in d.count) {
          var h = parseInt(hour)
          if (h < self.props.hours[0] || h > self.props.hours[1]) continue
          sum += d.count[hour]
        }
        if (sum > self.attr.maxSize) self.attr.maxSize = sum
      })
      .transition()
      .attr('r', function(d){
        var sum = 0
        for (var hour in d.count) {
          var h = parseInt(hour)
          if (h < self.props.hours[0] || h > self.props.hours[1]) continue
          sum += d.count[hour]
        }
        var result = sum / self.attr.maxSize * 30
        return result
      })
    this.attr.svg.selectAll('.link')
      .each(function(d){
        if (!self.props.normalize) return
        var sum = 0
        for (var hour in d.count) {
          var h = parseInt(hour)
          if (h < self.props.hours[0] || h > self.props.hours[1]) continue
          sum += d.count[hour]
        }
        if (sum > self.attr.maxWeight) self.attr.maxWeight = sum
      })
      .transition()
      .attr('stroke-width', function(d){
        var sum = 0
        for (var hour in d.count) {
          var h = parseInt(hour)
          if (h < self.props.hours[0] || h > self.props.hours[1]) continue
          sum += d.count[hour]
        }
        var result = sum / self.attr.maxWeight * 20
        return result
      })
      this.attr.force.start()
  },

  graph: function() {

    var self = this

    var node = this.attr.layer1.selectAll('.node')
      .data(this.attr.nodes)
    var nodeEnter = node.enter()
      .append('g')
      .attr('class', function(d){ return 'node c' + d.cluster })
      .on('mouseover', function(d){
        self.props.setCluster(d.cluster, d.lat, d.lon)
        $('#tooltip').css({
          visibility: 'visible',
          left: mapWidth + mapWidth + d.x - 40,
          top: d.y + 30,
        })
        .html(
          "cluster " + d.cluster + "<br>"
        )
      })
      .on('mouseout', function(d){
        self.props.setCluster(null, null, null)
        $('#tooltip').css('visibility', 'hidden')
      })
    nodeEnter.append('circle')
      .attr('r', 0)
      .attr('fill', function(d){ return color(d.cluster) })

    var link = this.attr.layer0.selectAll('.link')
      .data(this.attr.links)
      .enter()
      .append('path')
      .attr('stroke', function(d){ return color(d.source) })
      .attr('stroke-width', 0)
      .attr('fill', 'none')
      .attr('class', function(d){ return 'link c' + d.source + ' c' + d.target })

    this.attr.force.on('tick', function(e) {
      var k = e.alpha * 0.1
      d3.selectAll('.node').each(function(o,i){
        var sum = 0
        var sum2 = 0
        for (var hour in o.distance) {
          var h = parseInt(hour)
          if (h < self.props.hours[0] || h > self.props.hours[1]) continue
          sum += o.distance[hour]
          sum2 += o.distance[hour]
        }
        o.x += ((sum / 24 / 2) - o.x) * k
        o.y += ((graphHeight - (sum2 / 24 / 4)) - o.y) * k
      })
      node.attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')' })
      d3.selectAll('.link').attr('d', linkArc)
    })
    .nodes(this.attr.nodes)
    .links(this.attr.links)
    .start()

  },

  render: function() {
    return (
      <div className='Graph'>
        <div className='title'>origin-destination graph</div>
        <div className='graphX'>demand</div>
        <div className='graphY'>distance</div>
      </div>
    )
  }
})
