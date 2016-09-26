import csv

class Model:

    def __init__(self):
        return

    def source_hour_clustered(self):
        sources = []

        with open('data/source_hour_clustered.csv', 'rb') as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                sources.append({
                    'lat': float(row[0]),
                    'lon': float(row[1]),
                    'hour': int(row[2]),
                    'cluster': int(row[-1]),
                    'neighborhood': row[-2],
                    'commerce': [int(c) for c in row[11:21]],
                })

        return sources

    def demand_loss(self):
        sources = []

        with open('data/demand_loss.csv', 'rb') as f:
            reader = csv.reader(f)
            next(reader, None)
            next(reader, None)
            for row in reader:
                sources.append({
                    'lat': float(row[1]),
                    'lon': float(row[2]),
                    'loss': float(row[-3]),
                    'cluster': int(row[-2]),
                    'neighborhood': row[-1],
                    'steps': [int(c) for c in row[3:11]],
                })

        return sources

    def cluster_to_cluster(self):
        nodes = {}
        links = {}
        attributes = ['count', 'fare', 'distance']

        with open('data/cluster_to_cluster.csv', 'rb') as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                source = int(row[0])
                destination = int(row[1])
                pair = row[0] + ':' + row[1]
                hour = int(row[2])
                count = int(row[3])
                fare = float(row[5])
                distance = float(row[7])
                if source not in nodes:
                    nodes[source] = {
                        'cluster': source,
                    }
                    for attribute in attributes:
                        nodes[source][attribute] = {hour: 0 for hour in range(24)}
                if pair not in links:
                    links[pair] = {
                        'source': source,
                        'target': destination,
                    }
                    for attribute in attributes:
                        links[pair][attribute] = {hour: 0 for hour in range(24)}
                for attribute in attributes:
                    value = eval(attribute)
                    nodes[source][attribute][hour] += value
                    links[pair][attribute][hour] += value

        nodes = [nodes[node] for node in nodes]
        links = [links[link] for link in links]

        return {'nodes': nodes, 'links': links}
