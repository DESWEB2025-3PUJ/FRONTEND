import { Component, ViewChild } from '@angular/core';
import { CanvasDrawComponent } from '../../canvas-draw/canvas-draw.component';

@Component({
  selector: 'app-proceso-diagram',
  standalone: true,
  imports: [CanvasDrawComponent],
  templateUrl: './proceso-diagram.component.html',
  styleUrls: ['./proceso-diagram.component.css']
})
export class ProcesoDiagramComponent {
  @ViewChild(CanvasDrawComponent) canvasDraw!: CanvasDrawComponent;

  backToList() {
    console.log('Volver');
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
    const canvasRect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - canvasRect.left - 60;
    const y = e.clientY - canvasRect.top - 35;
    this.canvasDraw.addNode(type, x, y);
  }
}
