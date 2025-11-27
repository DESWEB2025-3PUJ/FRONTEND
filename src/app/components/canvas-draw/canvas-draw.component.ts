import {
  AfterViewInit, Component, ElementRef, ViewChild
} from '@angular/core';
import { newInstance, BrowserJsPlumbInstance } from '@jsplumb/community';

type NodeType = 'inicio' | 'actividad' | 'decision' | 'fin';

@Component({
  selector: 'app-canvas-draw',
  standalone: true,
  templateUrl: './canvas-draw.component.html',
  styleUrls: ['./canvas-draw.component.css'],
})
export class CanvasDrawComponent implements AfterViewInit {
  @ViewChild('board', { static: true }) boardRef!: ElementRef<HTMLDivElement>;

  private jsp!: BrowserJsPlumbInstance;
  private idSeq = 1;

  /** Pila para deshacer (últimas acciones) */
  private history: Array<
    | { kind: 'connection'; connId: string }
    | { kind: 'node'; el: HTMLElement }
  > = [];

  ngAfterViewInit(): void {
    // 1) Crear instancia
    this.jsp = newInstance({});
    // En algunas versiones, el container no se pasa en el constructor
    (this.jsp as any).setContainer(this.boardRef.nativeElement);

    // 2) Import defaults (algunas versiones no lo tipan, hacemos cast a any)
    (this.jsp as any).setSuspendDrawing?.(true);
    (this.jsp as any).importDefaults?.({
      connectionsDetachable: true,
      reattachConnections: true,
      connector: { type: 'Flowchart', options: { cornerRadius: 10, stub: 14 } },
      paintStyle: { stroke: '#2c3e50', strokeWidth: 3 },
      hoverPaintStyle: { stroke: '#0f172a', strokeWidth: 3 },
      endpoint: { type: 'Dot', options: { radius: 5 } },
      endpointStyle: { fill: '#1f2f40' },
      anchor: 'AutoDefault',
    });
    (this.jsp as any).setSuspendDrawing?.(false, true);

    // 3) Eventos (usa strings para evitar conflictos de tipos)
    (this.jsp as any).bind?.('connection', (info: any) => {
      this.history.push({ kind: 'connection', connId: info.connection.id });
    });
    (this.jsp as any).bind?.('connection:detached', (_info: any) => {
      // Si el usuario la borró, no apilamos nada adicional
    });
  }

  /** ============= API pública ============= */

  /** Crea un nodo nuevo en (x,y) del tipo indicado */
  public addNode(type: string, x: number, y: number): void {
    const t = (type?.toLowerCase() as NodeType) ?? 'actividad';

    const el = document.createElement('div');
    el.className = `proc-node ${this.cssForType(t)}`;
    el.id = `node-${this.idSeq++}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.dataset['type'] = t;

    el.innerText = this.labelForType(t);

    // “Puntos” visuales
    const left = document.createElement('div');
    left.className = 'proc-endpoint endpoint-left';
    const right = document.createElement('div');
    right.className = 'proc-endpoint endpoint-right';
    el.appendChild(left);
    el.appendChild(right);

    this.boardRef.nativeElement.appendChild(el);

    // Hacer draggable
    (this.jsp as any).draggable?.(el, { containment: this.boardRef.nativeElement });

    // Endpoints jsPlumb
    this.addEndpoints(el);

    // Pila para Undo
    this.history.push({ kind: 'node', el });
  }

  /** Exporta el diagrama (para el botón Guardar) */
  public exportDiagram() {
    const nodes: Array<{ id: string; type: string; x: number; y: number; w: number; h: number; name: string }> = [];
    const all = this.boardRef.nativeElement.querySelectorAll<HTMLElement>('.proc-node');
    const parentRect = this.boardRef.nativeElement.getBoundingClientRect();
    all.forEach((el) => {
      const rect = el.getBoundingClientRect();
      nodes.push({
        id: el.id,
        type: el.dataset['type'] || 'actividad',
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
        w: rect.width,
        h: rect.height,
        name: el.innerText.trim(),
      });
    });

    const conns: any[] = ((this.jsp as any).getConnections?.() ?? []);
    const edges = conns.map((c: any) => ({
      id: c.id,
      from: (c.source as HTMLElement).id,
      to: (c.target as HTMLElement).id,
    }));

    return {
      name: 'Proceso sin título',
      activities: nodes,
      edges,
    };
  }

  /** Deshacer última acción (conexión o nodo) */
  public undoLastAction(): void {
    const last = this.history.pop();
    if (!last) return;

    if (last.kind === 'connection') {
      const conns: any[] = ((this.jsp as any).getConnections?.() ?? []);
      const conn = conns.find((c: any) => c.id === last.connId);
      if (conn) (this.jsp as any).deleteConnection?.(conn);
    } else {
      const el = last.el;
      // Quita endpoints y conexiones del nodo
      (this.jsp as any).remove?.(el);
      el.remove();
    }
  }

  /** Limpiar todo el tablero */
  public clearAll(): void {
    (this.jsp as any).deleteEveryConnection?.();

    // Borrar endpoints existentes
    const sel = (this.jsp as any).selectEndpoints?.();
    if (sel?.each) {
      sel.each((ep: any) => (this.jsp as any).deleteEndpoint?.(ep));
    }

    // Quitar nodos del DOM
    const nodes = this.boardRef.nativeElement.querySelectorAll('.proc-node');
    nodes.forEach((n) => n.remove());

    // Limpiar pila
    this.history = [];
  }

  /** ========================= Internas ========================= */

  private addEndpoints(el: HTMLElement) {
    (this.jsp as any).addEndpoint?.(el, {
      anchor: 'Left',
      isSource: true,
      isTarget: true,
      maxConnections: -1,
      connectionsDetachable: true,
    });

    (this.jsp as any).addEndpoint?.(el, {
      anchor: 'Right',
      isSource: true,
      isTarget: true,
      maxConnections: -1,
      connectionsDetachable: true,
    });
  }

  private cssForType(t: NodeType) {
    switch (t) {
      case 'inicio': return 'proc-inicio';
      case 'actividad': return 'proc-actividad';
      case 'decision': return 'proc-decision';
      case 'fin': return 'proc-fin';
      default: return 'proc-actividad';
    }
  }
  private labelForType(t: NodeType) {
    switch (t) {
      case 'inicio': return 'Inicio';
      case 'actividad': return 'Actividad';
      case 'decision': return 'Decisión';
      case 'fin': return 'Fin';
      default: return 'Actividad';
    }
  }
}