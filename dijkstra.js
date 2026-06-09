// базовая реализация дейкстры
// Используется во всех задачах как основа.

// graph   — объект смежности: { узел: { сосед: вес, ... } }
// start   — стартовая вершина

// Возвращает: { costs, parents }
//   costs   — минимальные расстояния от start до каждой вершины
//   parents — «родитель» каждой вершины в кратчайшем пути

function dijkstra(graph, start) {
  const costs = {};
  const parents = {};
  const processed = new Set();

  // Инициализация: все расстояния бесконечны, кроме старта
  for (const node of Object.keys(graph)) {
    costs[node] = Infinity;
    parents[node] = null;
  }
  costs[start] = 0;

  // Находит необработанный узел с минимальной стоимостью
  function findLowestCostNode() {
    let lowestCost = Infinity;
    let lowestNode = null;
    for (const node of Object.keys(costs)) {
      if (costs[node] < lowestCost && !processed.has(node)) {
        lowestCost = costs[node];
        lowestNode = node;
      }
    }
    return lowestNode;
  }

  let node = findLowestCostNode();

  while (node !== null) {
    const cost = costs[node];
    const neighbors = graph[node] || {};

    // Обновляем стоимости соседей через текущий узел
    for (const neighbor of Object.keys(neighbors)) {
      const newCost = cost + neighbors[neighbor];
      if (newCost < costs[neighbor]) {
        costs[neighbor] = newCost;
        parents[neighbor] = node;
      }
    }

    processed.add(node);
    node = findLowestCostNode();
  }

  return { costs, parents };
}

// вспомогательная фукция: восстановление пути
// Идёт от конца к началу по таблице parents

function reconstructPath(parents, start, end) {
  const path = [];
  let current = end;
  while (current !== null) {
    path.unshift(current);
    current = parents[current];
  }
  // Проверяем, что путь действительно начинается со старта
  if (path[0] !== start) return null;
  return path;
}

// вспомогательная фукция: построение графа из списка рёбер
// edges — массив вида [["A", "B", вес], ...]
// directed — true для ориентированного, false для неориент.

function buildGraph(edges, directed = true) {
  const graph = {};
  for (const [from, to, weight] of edges) {
    if (!graph[from]) graph[from] = {};
    if (!graph[to]) graph[to] = {};
    graph[from][to] = weight;
    if (!directed) {
      graph[to][from] = weight;
    }
  }
  return graph;
}


// ЗАДАЧА 1. Восстановление пути
// Найти кратчайший путь от S до F и вывести его

function task1() {
  console.log("=== Задача 1: Восстановление пути ===");

  const edges = [
    ["S", "A", 1],
    ["S", "B", 4],
    ["A", "B", 2],
    ["A", "C", 5],
    ["B", "C", 1],
    ["B", "D", 3],
    ["C", "D", 3],
    ["C", "F", 2],
    ["D", "F", 1],
  ];

  const graph = buildGraph(edges);
  const { costs, parents } = dijkstra(graph, "S");

  const path = reconstructPath(parents, "S", "F");
  console.log(`Длина: ${costs["F"]}`);
  console.log(`Путь: ${path.join(" → ")}`);
  console.log();
}

// ЗАДАЧА 2. Граф с несколькими путями одинаковой длины
// Найти ВСЕ кратчайшие пути от X до Y


// Для этой задачи нужна отдельная функция — обычный Дейкстра
// запоминает только одного родителя. Здесь мы храним ВСЕХ
// родителей с одинаковой минимальной стоимостью.
function dijkstraAllPaths(graph, start) {
  const costs = {};
  const allParents = {}; // { узел: [родитель1, родитель2, ...] }
  const processed = new Set();

  for (const node of Object.keys(graph)) {
    costs[node] = Infinity;
    allParents[node] = [];
  }
  costs[start] = 0;

  function findLowestCostNode() {
    let lowestCost = Infinity;
    let lowestNode = null;
    for (const node of Object.keys(costs)) {
      if (costs[node] < lowestCost && !processed.has(node)) {
        lowestCost = costs[node];
        lowestNode = node;
      }
    }
    return lowestNode;
  }

  let node = findLowestCostNode();

  while (node !== null) {
    const cost = costs[node];
    const neighbors = graph[node] || {};

    for (const neighbor of Object.keys(neighbors)) {
      const newCost = cost + neighbors[neighbor];
      if (newCost < costs[neighbor]) {
        // Нашли более короткий путь — сбрасываем список родителей
        costs[neighbor] = newCost;
        allParents[neighbor] = [node];
      } else if (newCost === costs[neighbor]) {
        // Нашли путь той же длины — добавляем родителя
        allParents[neighbor].push(node);
      }
    }

    processed.add(node);
    node = findLowestCostNode();
  }

  return { costs, allParents };
}

// Рекурсивно восстанавливает все пути от start до end
function reconstructAllPaths(allParents, start, end) {
  if (end === start) return [[start]];
  const paths = [];
  for (const parent of allParents[end]) {
    const subPaths = reconstructAllPaths(allParents, start, parent);
    for (const subPath of subPaths) {
      paths.push([...subPath, end]);
    }
  }
  return paths;
}

function task2() {
  console.log("=== Задача 2: Несколько путей одинаковой длины ===");

  const edges = [
    ["X", "A", 3],
    ["X", "B", 2],
    ["A", "Y", 1],
    ["B", "Y", 2],
  ];

  const graph = buildGraph(edges);
  const { costs, allParents } = dijkstraAllPaths(graph, "X");

  const paths = reconstructAllPaths(allParents, "X", "Y");
  console.log(`Длина: ${costs["Y"]}`);
  console.log("Пути:");
  paths.forEach((path, i) => {
    console.log(`  ${i + 1}. ${path.join(" → ")}`);
  });
  console.log();
}

// ЗАДАЧА 3. Проверка на недостижимость
// Для вершин, недостижимых из A, вывести -1

function task3() {
  console.log("=== Задача 3: Проверка на недостижимость ===");

  const edges = [
    ["A", "B", 5],
    ["B", "C", 3],
    ["D", "E", 2], // D и E изолированы от A
  ];

  const graph = buildGraph(edges);
  const { costs } = dijkstra(graph, "A");

  // Все вершины графа (включая те, что только входят в рёбра)
  const allNodes = [...new Set(edges.flat().filter(x => typeof x === "string"))].sort();

  for (const node of allNodes) {
    const dist = costs[node] !== undefined ? costs[node] : Infinity;
    console.log(`${node}: ${dist === Infinity ? -1 : dist}`);
  }
  console.log();
}

// ЗАДАЧА 4. Маршрутизация в сети
// Найти кратчайший путь по задержкам от Router1 до Router5

function task4() {
  console.log("=== Задача 4: Маршрутизация в сети ===");

  const edges = [
    ["Router1", "Router2", 10],
    ["Router1", "Router3", 20],
    ["Router2", "Router4", 50],
    ["Router3", "Router4", 20],
    ["Router4", "Router5", 10],
    ["Router2", "Router5", 100],
  ];

  const graph = buildGraph(edges);
  const { costs, parents } = dijkstra(graph, "Router1");

  const path = reconstructPath(parents, "Router1", "Router5");
  console.log(`Длина: ${costs["Router5"]} мс`);
  console.log(`Путь: ${path.join(" → ")}`);
  console.log();
}

task1();
task2();
task3();
task4();
