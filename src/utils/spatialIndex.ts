/**
 * Spatial Index Implementation using Quadtree
 * 
 * Provides O(log n) hit testing for module selection on the canvas.
 * Falls back to O(n) for edge cases (overlapping modules, nested areas).
 */

import { PlacedModule, MODULE_SIZES } from '../types';

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IndexedItem {
  id: string;
  bounds: Bounds;
}

interface QuadTreeNode {
  bounds: Bounds;
  items: IndexedItem[];
  children: QuadTreeNode[] | null;
  depth: number;
}

const MAX_ITEMS = 8;
const MAX_DEPTH = 6;

function createNode(bounds: Bounds, depth: number = 0): QuadTreeNode {
  return {
    bounds,
    items: [],
    children: null,
    depth,
  };
}

function subdivide(node: QuadTreeNode): void {
  const { x, y, width, height } = node.bounds;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  node.children = [
    createNode({ x, y, width: halfWidth, height: halfHeight }, node.depth + 1),
    createNode({ x: x + halfWidth, y, width: halfWidth, height: halfHeight }, node.depth + 1),
    createNode({ x, y: y + halfHeight, width: halfWidth, height: halfHeight }, node.depth + 1),
    createNode({ x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }, node.depth + 1),
  ];

  // Redistribute items to children
  const itemsToRedistribute = [...node.items];
  node.items = [];

  for (const item of itemsToRedistribute) {
    insertIntoNode(node, item);
  }
}

function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

function boundsContains(outer: Bounds, inner: Bounds): boolean {
  return (
    inner.x >= outer.x &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y >= outer.y &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function insertIntoNode(node: QuadTreeNode, item: IndexedItem): boolean {
  // If node has children, try to insert into them
  if (node.children) {
    for (const child of node.children) {
      if (boundsContains(child.bounds, item.bounds)) {
        return insertIntoNode(child, item);
      }
    }
    // Item spans multiple children, keep it in this node
    node.items.push(item);
    return true;
  }

  // Add to this node
  node.items.push(item);

  // Check if subdivision is needed
  if (node.items.length > MAX_ITEMS && node.depth < MAX_DEPTH) {
    subdivide(node);
  }

  return true;
}

function queryPoint(node: QuadTreeNode, x: number, y: number, results: IndexedItem[]): void {
  // Check items in this node
  for (const item of node.items) {
    if (
      x >= item.bounds.x &&
      x <= item.bounds.x + item.bounds.width &&
      y >= item.bounds.y &&
      y <= item.bounds.y + item.bounds.height
    ) {
      results.push(item);
    }
  }

  // Check children
  if (node.children) {
    for (const child of node.children) {
      if (
        x >= child.bounds.x &&
        x <= child.bounds.x + child.bounds.width &&
        y >= child.bounds.y &&
        y <= child.bounds.y + child.bounds.height
      ) {
        queryPoint(child, x, y, results);
      }
    }
  }
}

function queryRect(node: QuadTreeNode, rect: Bounds, results: IndexedItem[]): void {
  // Check items in this node
  for (const item of node.items) {
    if (boundsIntersect(item.bounds, rect)) {
      results.push(item);
    }
  }

  // Check children
  if (node.children) {
    for (const child of node.children) {
      if (boundsIntersect(child.bounds, rect)) {
        queryRect(child, rect, results);
      }
    }
  }
}

function removeFromNode(node: QuadTreeNode, itemId: string): boolean {
  // Remove from this node's items
  const index = node.items.findIndex(item => item.id === itemId);
  if (index !== -1) {
    node.items.splice(index, 1);
    return true;
  }

  // Try children
  if (node.children) {
    for (const child of node.children) {
      if (removeFromNode(child, itemId)) {
        return true;
      }
    }
  }

  return false;
}

function clearNode(node: QuadTreeNode): void {
  node.items = [];
  if (node.children) {
    for (const child of node.children) {
      clearNode(child);
    }
    node.children = null;
  }
}

/**
 * Module spatial index for canvas hit testing
 * Provides O(log n) performance for module selection using quadtree
 */
export class ModuleSpatialIndex {
  private root: QuadTreeNode;
  private itemMap: Map<string, IndexedItem> = new Map();

  constructor(bounds: Bounds = { x: -10000, y: -10000, width: 20000, height: 20000 }) {
    this.root = createNode(bounds);
  }

  /**
   * Get module bounds from a placed module
   */
  private getModuleBounds(module: PlacedModule): Bounds {
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    return {
      x: module.x,
      y: module.y,
      width: size.width,
      height: size.height,
    };
  }

  /**
   * Insert a module into the index
   */
  insert(module: PlacedModule): void {
    const item: IndexedItem = {
      id: module.instanceId,
      bounds: this.getModuleBounds(module),
    };
    this.itemMap.set(item.id, item);
    insertIntoNode(this.root, item);
  }

  /**
   * Remove a module by instance ID
   */
  remove(moduleId: string): boolean {
    if (!this.itemMap.has(moduleId)) {
      return false;
    }
    this.itemMap.delete(moduleId);
    return removeFromNode(this.root, moduleId);
  }

  /**
   * Get module at a point (for hit testing)
   * Returns the topmost module (smallest area if overlapping)
   */
  getModuleAtPoint(x: number, y: number): string | null {
    const results: IndexedItem[] = [];
    queryPoint(this.root, x, y, results);
    
    if (results.length === 0) return null;
    
    // Sort by area (smallest/best match first)
    results.sort((a, b) => {
      const areaA = a.bounds.width * a.bounds.height;
      const areaB = b.bounds.width * b.bounds.height;
      return areaA - areaB;
    });
    
    return results[0].id;
  }

  /**
   * Get all modules within a rectangle (for box selection)
   */
  getModulesInRect(x: number, y: number, width: number, height: number): string[] {
    const results: IndexedItem[] = [];
    queryRect(this.root, { x, y, width, height }, results);
    return results.map(r => r.id);
  }

  /**
   * Update a module's position
   */
  update(module: PlacedModule): void {
    this.remove(module.instanceId);
    this.insert(module);
  }

  /**
   * Rebuild the entire index from a list of modules
   */
  rebuild(modules: PlacedModule[]): void {
    this.clear();
    for (const module of modules) {
      this.insert(module);
    }
  }

  /**
   * Clear the index
   */
  clear(): void {
    clearNode(this.root);
    this.itemMap.clear();
  }

  /**
   * Get the number of indexed modules
   */
  get size(): number {
    return this.itemMap.size;
  }
}

// Singleton instance for canvas hit testing
let canvasSpatialIndex: ModuleSpatialIndex | null = null;

export function getCanvasSpatialIndex(): ModuleSpatialIndex {
  if (!canvasSpatialIndex) {
    canvasSpatialIndex = new ModuleSpatialIndex();
  }
  return canvasSpatialIndex;
}

export function resetCanvasSpatialIndex(): void {
  canvasSpatialIndex = new ModuleSpatialIndex();
}

export default ModuleSpatialIndex;
