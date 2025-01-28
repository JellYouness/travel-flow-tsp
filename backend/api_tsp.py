from flask import Flask, jsonify, request
from flask_cors import CORS
from geopy.distance import geodesic
import math

# Initialiser l'application Flask
app = Flask(__name__)
CORS(app)  # Activer CORS

# Fonction pour calculer la matrice des distances
def calculate_distance_matrix(locations):
    n = len(locations)
    dist_matrix = [[0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i != j:
                coord1 = (locations[i]['lat'], locations[i]['lng'])
                coord2 = (locations[j]['lat'], locations[j]['lng'])
                dist_matrix[i][j] = geodesic(coord1, coord2).km
    return dist_matrix

# Algorithme Held-Karp avec reconstruction du trajet
def held_karp_with_path(dist):
    n = len(dist)
    dp = [[math.inf] * n for _ in range(1 << n)]
    parent = [[-1] * n for _ in range(1 << n)]
    dp[1][0] = 0

    for subset in range(1, 1 << n):
        for last in range(n):
            if subset & (1 << last):
                prev_subset = subset & ~(1 << last)
                if prev_subset == 0:
                    continue
                for prev in range(n):
                    if prev != last and (prev_subset & (1 << prev)):
                        cost = dp[prev_subset][prev] + dist[prev][last]
                        if cost < dp[subset][last]:
                            dp[subset][last] = cost
                            parent[subset][last] = prev

    min_cost = math.inf
    last_node = -1
    for i in range(1, n):
        cost = dp[(1 << n) - 1][i] + dist[i][0]
        if cost < min_cost:
            min_cost = cost
            last_node = i

    path = []
    subset = (1 << n) - 1
    while last_node != -1:
        path.append(last_node)
        temp = subset
        subset &= ~(1 << last_node)
        last_node = parent[temp][last_node]

    path.reverse()
    path.append(0)

    return min_cost, path

# Algorithme du plus proche voisin
def nearest_neighbor(dist_matrix):
    n = len(dist_matrix)
    visited = [False] * n
    path = [0]
    visited[0] = True
    total_distance = 0

    while len(path) < n:
        current_city = path[-1]
        next_city = min(
            (dist_matrix[current_city][j], j) for j in range(n) if not visited[j]
        )[1]
        path.append(next_city)
        visited[next_city] = True
        total_distance += dist_matrix[current_city][next_city]

    total_distance += dist_matrix[path[-1]][path[0]]
    path.append(path[0])
    return total_distance, path

# Algorithme Best Edge
def best_edge_tsp(distance_matrix):
    n = len(distance_matrix)
    edges = [(i, j, distance_matrix[i][j]) for i in range(n) for j in range(i + 1, n)]
    edges.sort(key=lambda x: x[2])  # Trier les arêtes par poids croissant

    connections = {i: [] for i in range(n)}  # Suivi des connexions
    selected_edges = []

    for edge in edges:
        u, v, weight = edge
        if len(connections[u]) < 2 and len(connections[v]) < 2:
            connections[u].append(v)
            connections[v].append(u)
            selected_edges.append((u, v, weight))

            if len(selected_edges) == n:
                if is_valid_cycle(selected_edges, n):
                    break

    # Reconstruct the path from the edges
    path = reconstruct_path_from_edges(selected_edges, n)
    total_distance = sum(edge[2] for edge in selected_edges)
    return total_distance, path

def reconstruct_path_from_edges(edges, n):
    adjacency = {i: [] for i in range(n)}
    for u, v, _ in edges:
        adjacency[u].append(v)
        adjacency[v].append(u)

    path = []
    visited = set()

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        path.append(node)
        for neighbor in adjacency[node]:
            dfs(neighbor)

    dfs(0)  # Start from node 0
    return path + [0]  # Close the cycle


def is_valid_cycle(path, n):
    visited = set()
    stack = [path[0][0]]
    while stack:
        city = stack.pop()
        if city in visited:
            continue
        visited.add(city)
        for u, v, _ in path:
            if u == city and v not in visited:
                stack.append(v)
            elif v == city and u not in visited:
                stack.append(u)
    return len(visited) == n

# Endpoint pour résoudre le TSP avec Held-Karp
@app.route('/solve_tsp', methods=['POST'])
def solve_tsp():
    data = request.get_json()
    if not data or 'locations' not in data:
        return jsonify({"error": "Les données sont manquantes"}), 400

    locations = data['locations']
    if len(locations) < 2:
        return jsonify({"error": "Veuillez fournir au moins deux emplacements"}), 400

    try:
        dist_matrix = calculate_distance_matrix(locations)
        min_cost, path = held_karp_with_path(dist_matrix)
        path_coords = [{"lat": locations[i]['lat'], "lng": locations[i]['lng']} for i in path]
        return jsonify({
            "min_cost": round(min_cost, 2),
            "path": path,
            "coords": path_coords
        })
    except Exception as e:
        return jsonify({"error": f"Une erreur est survenue : {str(e)}"}), 500

# Endpoint pour résoudre le TSP avec Nearest Neighbor
@app.route('/solve_tsp_nn', methods=['POST'])
def solve_tsp_nn():
    data = request.get_json()
    if not data or 'locations' not in data:
        return jsonify({"error": "Les données sont manquantes"}), 400

    locations = data['locations']
    if len(locations) < 2:
        return jsonify({"error": "Veuillez fournir au moins deux emplacements"}), 400

    try:
        dist_matrix = calculate_distance_matrix(locations)
        total_distance, path = nearest_neighbor(dist_matrix)
        path_coords = [{"lat": locations[i]['lat'], "lng": locations[i]['lng']} for i in path]
        return jsonify({
            "total_distance": round(total_distance, 2),
            "path": path,
            "coords": path_coords
        })
    except Exception as e:
        return jsonify({"error": f"Une erreur est survenue : {str(e)}"}), 500

# Endpoint pour résoudre le TSP avec Best Edge
@app.route('/solve_tsp_be', methods=['POST'])
def solve_tsp_be():
    data = request.get_json()
    if not data or 'locations' not in data:
        return jsonify({"error": "Les données sont manquantes"}), 400

    locations = data['locations']
    if len(locations) < 2:
        return jsonify({"error": "Veuillez fournir au moins deux emplacements"}), 400

    try:
        dist_matrix = calculate_distance_matrix(locations)
        total_distance, path = best_edge_tsp(dist_matrix)
        path_coords = [{"lat": locations[i]['lat'], "lng": locations[i]['lng']} for i in path]
        return jsonify({
            "total_distance": round(total_distance, 2),
            "path": path,
            "coords": path_coords
        })
    except Exception as e:
        return jsonify({"error": f"Une erreur est survenue : {str(e)}"}), 500


# Lancer le serveur
if __name__ == '__main__':
    app.run(debug=True, port=5000)
