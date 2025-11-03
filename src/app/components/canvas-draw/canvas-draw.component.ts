import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as fabric from 'fabric';

@Component({
  selector: 'app-canvas-draw',
  standalone: true,
  templateUrl: './canvas-draw.component.html',
  styleUrls: ['./canvas-draw.component.css']
})
export class CanvasDrawComponent implements AfterViewInit {
  @ViewChild('processCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: fabric.Canvas;
  private nodes: fabric.Group[] = [];
  private lines: { from: fabric.Group; to: fabric.Group; line: fabric.Line }[] = [];

  private tempLine: fabric.Line | null = null;
  private sourceNode: fabric.Group | null = null;

  ngAfterViewInit() {
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      width: 1100,
      height: 650,
      backgroundColor: '#f9fafb',
      selection: false
    });

    // Actualiza las líneas cuando se mueven los nodos
    this.canvas.on('object:moving', () => this.updateConnections());
  }

  /** Crear un nodo visual */
  public addNode(type: string, x: number, y: number) {
    const colors: Record<string, string> = {
      inicio: '#22c55e',
      actividad: '#3b82f6',
      decision: '#f59e0b',
      fin: '#ef4444'
    };

    const rect = new fabric.Rect({
      width: 130,
      height: 70,
      fill: colors[type] || '#9ca3af',
      rx: 10,
      ry: 10,
      stroke: '#1e293b',
      strokeWidth: 1.5,
      originX: 'center',
      originY: 'center'
    });

    const text = new fabric.Text(type.charAt(0).toUpperCase() + type.slice(1), {
      fontSize: 16,
      fill: '#fff',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center'
    });

    const node = new fabric.Group([rect, text], {
      left: x,
      top: y,
      hasControls: false
    });

    node.on('mousedown', () => this.handleNodeClick(node));

    this.canvas.add(node);
    this.nodes.push(node);
  }

  /** Maneja el clic en un nodo (inicio o fin de conexión) */
  private handleNodeClick(node: fabric.Group) {
    if (!this.sourceNode) {
      // Primer clic → empezar línea temporal
      this.sourceNode = node;

      const center = node.getCenterPoint();
      this.tempLine = new fabric.Line([center.x, center.y, center.x, center.y], {
        stroke: '#2563eb',
        strokeWidth: 2,
        selectable: false,
        evented: false
      });
      this.canvas.add(this.tempLine);

      // Mover la punta con el mouse (sin tipado estricto)
      this.canvas.on('mouse:move', (event: any) => this.handleMouseMove(event));
    } else {
      // Segundo clic → completar conexión
      const targetNode = node;
      if (targetNode !== this.sourceNode) {
        this.createConnection(this.sourceNode, targetNode);
      }

      // Limpiar estado temporal
      this.canvas.off('mouse:move');
      if (this.tempLine) this.canvas.remove(this.tempLine);
      this.tempLine = null;
      this.sourceNode = null;
    }
  }

  /** Mueve la punta de la línea mientras se arrastra el mouse */
  private handleMouseMove(event: any) {
    if (!this.tempLine) return;
    const pointer = this.canvas.getPointer(event.e);
    this.tempLine.set({ x2: pointer.x, y2: pointer.y });
    this.canvas.requestRenderAll();
  }

  /**  Crear línea definitiva entre dos nodos */
  private createConnection(from: fabric.Group, to: fabric.Group) {
    const { x1, y1, x2, y2 } = this.calculateEdgePoints(from, to);
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: '#2563eb',
      strokeWidth: 2,
      selectable: false,
      evented: false
    });

    this.canvas.add(line);
    this.canvas.sendObjectToBack(line); 
    this.lines.push({ from, to, line });
    this.updateConnections();
  }

  /** Reposicionar líneas cuando se mueven los nodos */
  private updateConnections() {
    for (const conn of this.lines) {
      const { x1, y1, x2, y2 } = this.calculateEdgePoints(conn.from, conn.to);
      conn.line.set({ x1, y1, x2, y2 });
    }
    this.canvas.requestRenderAll();
  }

  /**  Calcula los puntos de conexión en los bordes */
  private calculateEdgePoints(r1: fabric.Group, r2: fabric.Group) {
    const c1 = r1.getCenterPoint();
    const c2 = r2.getCenterPoint();
    const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
    const w1 = (r1.width ?? 100) / 2;
    const h1 = (r1.height ?? 50) / 2;
    const w2 = (r2.width ?? 100) / 2;
    const h2 = (r2.height ?? 50) / 2;
    const x1 = c1.x + w1 * Math.cos(angle);
    const y1 = c1.y + h1 * Math.sin(angle);
    const x2 = c2.x - w2 * Math.cos(angle);
    const y2 = c2.y - h2 * Math.sin(angle);
    return { x1, y1, x2, y2 };
  }
}
