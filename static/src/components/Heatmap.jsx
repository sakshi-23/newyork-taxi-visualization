Heatmap = React.createClass({
  getInitialState: function() {
    return {
      demand: {},
      sources: {},
      clusters: [],
    }
  },

  componentDidMount: function() {
    var self = this
    this.attr = {}
    this.attr.svg = d3.select('.Heatdisplay').append('svg')
      .attr('width', mapWidth)
      .attr('height', mapHeight)
    queue(1)
      .defer(requestData, '/demand')
      .defer(requestData, '/sources')
      .awaitAll(function(error, results) {
        var demand = results[0].demand
        var sources = results[1].sources
        var clusters = {}
        self.attr.svg.selectAll('.sources')
          .data(sources)
          .enter()
          .append('circle')
          .attr('r', 2)
          .attr('fill', '#333')
          .attr('cx', function(d){ return (d.lat - 40.44) * 600 })
          .attr('cy', function(d){ return (d.lon + 74.5) * 600 })
          .attr('class', function(d){ return 'dsource c' + d.cluster + ' h' + d.hour })
        self.attr.svg.selectAll('.demand')
          .data(demand)
          .enter()
          .append('circle')
          .attr('r', 2)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0)
          .attr('fill', function(d){ return 'rgb(' + parseInt(Math.log(d.loss) / 15.85 * 255) + ',60,60)' })
          .attr('cx', function(d){ return (d.lat - 40.44) * 600 })
          .attr('cy', function(d){ return (d.lon + 74.5) * 600 })
          .attr('class', function(d){ return 'demand c' + d.cluster })
          .on('mouseover', function(d){
            self.props.setCluster(d.cluster, d.lat, d.lon)
            var x = -50 + (d.lat - 40.44) * 600
            var y = (d.lon + 74.5) * 600
            $('#tooltip').css({
              visibility: 'visible',
              left: x,
              top: y + 30,
            })
            .html(
              "cluster " + d.cluster + "<br>" +
              d.neighborhood + "<br>" +
              "loss: " + parseInt(d.loss / 1000.0) + "K<br>"
            )
          })
          .on('mouseout', function(){
            self.props.setCluster(null, null, null)
            $('#tooltip').css('visibility', 'hidden')
          })
        for (var s = 0; s < demand.length; s++) {
          if (clusters[demand[s].cluster] == null) clusters[demand[s].cluster] = [0, 0, 0, 0, 0, 0, 0, 0]
          clusters[demand[s].cluster] = clusters[demand[s].cluster].map(function(num,idx) {
            return num + demand[s].steps[idx]
          })
        }
        self.setState({ demand: demand, sources: sources, clusters: clusters })
      })
  },

  componentDidUpdate: function() {
    var hours = this.props.hours
    var selection = ''
    for (var h = hours[0]; h < hours[1]; h++) {
      selection += '.h' + h + ','
    }
    selection = selection.substring(0, selection.length - 1)
    $('.dsource').css('opacity', 0)
    $('.dsource').filter(selection).css('opacity', 1)
  },

  render: function() {
    var self = this

    var stats
    if (self.props.cluster != null && self.state.clusters[self.props.cluster] != null) {
      yscale.domain(d3.extent(self.state.clusters[self.props.cluster]))
      var chart = line(self.state.clusters[self.props.cluster])
      var first = yscale(self.state.clusters[self.props.cluster][0])
      var five = yscale(self.state.clusters[self.props.cluster][0] * 0.99)
      var above = yscale(self.state.clusters[self.props.cluster][0] * 1.01)
      var ten = yscale(self.state.clusters[self.props.cluster][0] * 0.95)
      var tenAbove = yscale(self.state.clusters[self.props.cluster][0] * 1.05)
      stats = (
        <div>
          <div className='title'>{ "cluster " + self.props.cluster + " revenue" }</div>
          <svg className='chart'>
            {
              <g>
                <line className='refLine' x1='0' x2='350' y1={ first } y2={ first }></line>
                <line stroke='#333' x1='0' x2='350' y1={ five } y2={ five }></line>
                <line stroke='#333' x1='0' x2='350' y1={ above } y2={ above }></line>
                <line stroke='#333' x1='0' x2='350' y1={ ten } y2={ ten }></line>
                <line stroke='#333' x1='0' x2='350' y1={ tenAbove } y2={ tenAbove }></line>
                <text fill='#948787' y={ above } text-anchor='end' x='320'>+1%</text>
                <text fill='#948787' y={ five } text-anchor='end' x='320'>-1%</text>
                  <text fill='#948787' y={ tenAbove } text-anchor='end' x='320'>+5%</text>
                  <text fill='#948787' y={ ten } text-anchor='end' x='320'>-5%</text>
                <path fill='none' stroke={ color(self.props.cluster) } stroke-width='100' d={ chart }></path>
              </g>
            }
            {
              self.state.clusters[self.props.cluster].map(function(d,i){
                return (
                  <g>
                      <text className='chartLabel' y='310' x={ 15 + i * 50 } >{ years[i] }</text>
                  </g>
                )
              })
            }
          </svg>
        </div>
      )
    } else {
      stats = <div></div>
    }

    return (
      <div className='Heatmap'>
        <div className='Heatdisplay'>
            <div className='title'>revenue loss map</div>
        </div>
        { stats }
      </div>
    )
  }
})
