import { GraphModel } from "../models/GraphModel";
import { Node } from "../models/Node";
import { Container } from "../models/Container";

export const createInitialGraph = (): GraphModel => {
  const graph = new GraphModel();

  const default_size = { width: 100, height: 50};

  // Containers
  const container1: Container = {
    id: "container1",
    label: "Container 1",
    position: { x: 100, y: 50 },
    size: { width: 300, height: 300 },
    nodeIds: [],
    childContainerIds: [],
    collapsed: false,
  };
  const container2: Container = {
    id: "container2",
    label: "Container 2",
    //position: { x: 500, y: 200 },
    position: { x: 120, y: 200 },
    size: { width: 250, height: 350 },
    nodeIds: [],
    childContainerIds: [],
    collapsed: false,
  };

  graph.addContainer(container1);
  graph.addContainer(container2);

  // Nodes
  const nodeA: Node = { id: "nodeA", label: "Node A", size: default_size, position: { x: 120, y: 100 } };
  const nodeB: Node = { id: "nodeB", label: "Node B", size: default_size, position: { x: 180, y: 150 } };
  const nodeC: Node = { id: "nodeC", label: "Node C", size: default_size, position: { x: 520, y: 250 } };
  const nodeD: Node = { id: "nodeD", label: "Node D", size: default_size, position: { x: 550, y: 300 } };

  graph.addNode(nodeA);
  graph.addNode(nodeB);
  graph.addNode(nodeC);
  graph.addNode(nodeD);

  // Assign nodes to containers
  graph.containersById["container1"].nodeIds.push("nodeA", "nodeB");
  graph.containersById["container2"].nodeIds.push("nodeC", "nodeD");
  nodeA.parentId = "container1";
  nodeB.parentId = "container1";
  nodeC.parentId = "container2";
  nodeD.parentId = "container2";

  return graph;
};

