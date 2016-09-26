Map = React.createClass({
  getInitialState: function() {
    return {
      sources: {},
      hours: {},
    }
  },

  componentDidMount: function() {
    var self = this
    this.attr = {}
    this.attr.svg = d3.select('.Mapdisplay').append('svg')
      .attr('width', mapWidth)
      .attr('height', mapHeight)
    queue(1)
      .defer(requestData, '/sources')
      .awaitAll(function(error, results) {
        var sources = results[0].sources
        var clusters = {}
        var hours = {}
        for (var s = 0; s < sources.length; s++) {
          if (hours[sources[s].cluster] == null) hours[sources[s].cluster] = {}
          if (hours[sources[s].cluster][sources[s].hour] == null) hours[sources[s].cluster][sources[s].hour] = 0
          hours[sources[s].cluster][sources[s].hour] ++
        }
        self.attr.svg.selectAll('.source')
          .data(sources)
          .enter()
          .append('circle')
          .attr('r', 2)
          .attr('fill', function(d){ return color(d.cluster) })
          .attr('cx', function(d){ return (d.lat - 40.44) * 600 })
          .attr('cy', function(d){ return (d.lon + 74.5) * 600 })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0)
          .attr('class', function(d){ return 'source c' + d.cluster + ' h' + d.hour })
          .on('mouseover', function(d){
            self.props.setCluster(d.cluster, d.lat, d.lon)
            var x = -40 + (d.lat - 40.44) * 600
            var y = (d.lon + 74.5) * 600
            $('#tooltip').css({
              visibility: 'visible',
              left: mapWidth + x,
              top: y + 30,
            })
            .html(
              "cluster " + d.cluster + "<br>" +
              d.neighborhood + "<br>"
            )
          })
          .on('mouseout', function(){
            self.props.setCluster(null, null, null)
            $('#tooltip').css('visibility', 'hidden')
          })
        var sourceMap = {}
        var commerceMax = [0, 0, 0, 0, 0, 0, 0, 0]
        for (var s = 0; s < sources.length; s++) {
          if (clusters[sources[s].cluster] == null) clusters[sources[s].cluster] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          clusters[sources[s].cluster] = clusters[sources[s].cluster].map(function(num,idx) {
            return num + sources[s].commerce[idx]
          })
          sourceMap[sources[s].lat + ':' + sources[s].lon] = sources[s]
        }
        for (var s in clusters) {
          for (var c = 0; c < clusters[s].length; c++) {
            if (clusters[s][c] > commerceMax[c]) commerceMax[c] = clusters[s][c]
          }
        }
        self.setState({ sources: sourceMap, commerceMax: commerceMax, clusters: clusters, hours: hours })
      })
  },

  componentWillReceiveProps: function(newProps) {
    if (this.props.hours != newProps.hours) {
      var hours = this.props.hours
      var selection = ''
      for (var h = hours[0]; h < hours[1]; h++) {
        selection += '.h' + h + ','
      }
      selection = selection.substring(0, selection.length - 1)
      $('.source').css('opacity', 0)
      $(selection).css('opacity', 1)
    }
  },

  drawChart: function(values) {
    values.forEach(function(d){
      return (<div>d</div>)
    })
  },

  render: function() {
    var self = this

    var stats
    if (self.props.cluster != null) {
      self.props.highlightHours(self.state.hours[self.props.cluster])
      stats = (
        <div>
          <div className='title'>{ "cluster " + self.props.cluster + " commercial stats" }</div>
          <svg className='chart'>
            {
              self.state.clusters[self.props.cluster].map(function(d,i){
                var height = d / self.state.commerceMax[i] * 300
                if (isNaN(height)) return <g></g>
                return (
                  <g>
                    <rect fill={ color(self.props.cluster) } x={ i * 50 } y={ 300 - height } width='30' height={ height }></rect>
                    <text className='chartNumber' y={ 300 - height + 10 } x={ 15 + i * 50 } >{ self.state.clusters[self.props.cluster][i] }</text>
                    <text className='chartLabel' y='310' x={ 15 + i * 50 } >{ categories[i] }</text>
                  </g>
                )
                })
            }
          </svg>
        </div>
      )
    } else {
      self.props.highlightHours(null)
      stats = <div></div>
    }

    return (
      <div className='Map'>
        <div className='Mapdisplay'>
            <div className='title'>cluster map</div>
        </div>
        { stats }
      </div>
    )
  }
})
