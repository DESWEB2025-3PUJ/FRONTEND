import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasDrawComponent } from '../../canvas-draw/canvas-draw.component';

@Component({
  selector: 'app-proceso-diagram',
  standalone: true,
  imports: [CanvasDrawComponent],
  templateUrl: './proceso-diagram.component.html',
  styleUrls: ['./proceso-diagram.component.css'],
})
export class ProcesoDiagramComponent {
  @ViewChild(CanvasDrawComponent) canvasDraw!: CanvasDrawComponent;

  constructor(private router: Router) {}

  backToList() {
    this.router.navigate(['/procesos']);
  }

  guardarProceso() {
    const data = this.canvasDraw.exportDiagram();
    console.log('Proceso exportado:', data);
    // <-- Aquí, cuando quieras, llamas a tu servicio HTTP para persistir.
  }

  undoLast() {
    this.canvasDraw.undoLastAction();
  }

  clearCanvas() {
    this.canvasDraw.clearAll();
  }

  onDragStart(ev: DragEvent, type: string) {
    ev.dataTransfer?.setData('nodeType', type);
  }
  onCanvasDragOver(e: DragEvent) {
    e.preventDefault();
  }
  onCanvasDrop(e: DragEvent) {
    e.preventDefault();
    const type = e.dataTransfer?.getData('nodeType')!;
    const host = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - host.left - 90; // centrado aproximado
    const y = e.clientY - host.top - 45;
    this.canvasDraw.addNode(type, x, y);
  }
}