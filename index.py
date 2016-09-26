import flask
import model
import simplejson as json
from werkzeug.contrib.cache import SimpleCache

app = flask.Flask(__name__)
cache = SimpleCache()

@app.route('/')
def index():
    return flask.render_template('index.html')

@app.route('/sources')
def sources():
    m = model.Model()
    sources = m.source_hour_clustered()
    return json.dumps({'sources': sources})

@app.route('/demand')
def demand():
    m = model.Model()
    demand = m.demand_loss()
    return json.dumps({'demand': demand})

@app.route('/pairs')
def pairs():
    m = model.Model()
    pairs = m.cluster_to_cluster()
    return json.dumps({'pairs': pairs})

if __name__ == '__main__':
    app.debug = True
    app.run()
