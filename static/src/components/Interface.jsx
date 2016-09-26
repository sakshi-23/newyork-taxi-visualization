Interface = React.createClass({
  getInitialState: function() {
    return {
      hours: [0, 24],
      cluster: null,
      square: null,
    }
  },

  componentDidMount: function() {
    var self = this
    d3.select('#hours').call(
      d3.slider().axis(d3.svg.axis().ticks(24)).min(0).max(24).step(1).value([0, 24])
        .on('slideend', function(e, value) {
          d3.selectAll('.tick').select('text')
            .attr('fill', '#000')
            .filter(function(d){
              return d >= value[0] && d <= value[1]
            })
            .attr('fill', '#948787')
          if (value != self.state.hours) {
            self.setState({ hours: [value[0], value[1]] })
          }
        })
    )
    d3.selectAll('.tick').select('text').attr('fill', '#948787')
  },

  setCluster: function(cluster, lat, lon) {
    $all = $('.source, .demand, .node, .link')
    $all.css('opacity', 1)
    if (cluster != null) $all.not('.c' + cluster).css('opacity', 0)
    this.setState({ cluster: cluster, square: lat + ':' + lon })
  },

  highlightHours: function(dict) {
    var self = this
    d3.selectAll('.tick').select('text')
      .attr('fill', '#000')
      .filter(function(d){
        return d >= self.state.hours[0] && d <= self.state.hours[1]
      })
      .attr('fill', '#948787')
    for (var hour in dict) {
      $('.tick:contains(' + hour + ') > text').attr('fill', color(self.state.cluster))
    }
  },

  render: function() {
    var self = this
    return (
      <div className='Interface'>
        <div id='hours'></div>
        <Heatmap square={ self.state.square } cluster={ self.state.cluster } setCluster={ self.setCluster } hours={ self.state.hours }/>
        <Map highlightHours={ self.highlightHours } square={ self.state.square } cluster={ self.state.cluster } setCluster={ self.setCluster } hours={ self.state.hours }/>
        <Graph square={ self.state.square } cluster={ self.state.cluster } setCluster={ self.setCluster } hours={ self.state.hours } normalize={ false }/>
        <div id='tooltip'>asdasd</div>
      </div>
    )
  }
})
