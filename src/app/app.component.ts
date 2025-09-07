import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, DialogModule, SelectButtonModule, FormsModule, TextareaModule, ConfirmDialog, ToastModule, TooltipModule, InputTextModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  listaElementos: string[] = [];
  listaElementosDescartados: string[] = [];
  elementosAnadir: string = '';
  inputEditarElementoOriginal: string = '';
  inputEditarElemento: string = '';

  dialogoVisible: boolean = false;
  dialogoEditarElementoVisible: boolean = false;
  stateOptions: any[] = [{ label: 'Lista actual', value: false },{ label: 'Descartados', value: true }];
  modoDescartados: boolean = false;

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.listaElementos = JSON.parse(localStorage.getItem('listaElementos') ?? '[]') as string[];
    this.listaElementosDescartados = JSON.parse(localStorage.getItem('listaElementosDescartados') ?? '[]') as string[];
  }

  guardarListaElementos() {
    localStorage.setItem(
      'listaElementos',
      JSON.stringify(Array.isArray(this.listaElementos) ? this.listaElementos : [])
    );
  }
  guardarListaElementosDescartados() {
    localStorage.setItem(
      'listaElementosDescartados',
      JSON.stringify(Array.isArray(this.listaElementos) ? this.listaElementos : [])
    );
  }

  confirmarAnadirElementos(event: Event) {
    if (!this.elementosAnadir) {
      return;
    }

    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: '¿Añadir todos los elementos a la lista?',
        header: 'Confirmación',
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
            label: 'Cancelar',
            severity: 'secondary',
            outlined: true,
        },
        acceptButtonProps: {
            label: 'Añadir',
        },
        accept: () => {
          this.anadirElementos();
          this.messageService.add({ severity: 'info', summary: 'Elementos añadidos' });
        },
    });
  }

  confirmarEliminarElemento(elemento: string) {
      this.confirmationService.confirm({
          message: '¿Eliminar "' + elemento + '"?',
          header: 'Confirmación',
          closable: true,
          closeOnEscape: true,
          icon: 'pi pi-exclamation-triangle',
          acceptButtonProps: {
              label: 'Eliminar',
              severity: 'danger',
          },
          rejectButtonProps: {
              label: 'Cancelar',
              severity: 'secondary',
              outlined: true,
          },
          accept: () => {
            this.eliminarElemento(elemento);
          },
      });
  }
  
  confirmarEliminarTodo() {
      this.confirmationService.confirm({
          message: '¿Eliminar todos los elementos de la lista?',
          header: 'Confirmación',
          closable: true,
          closeOnEscape: true,
          icon: 'pi pi-exclamation-triangle',
          acceptButtonProps: {
              label: 'Eliminar',
              severity: 'danger',
          },
          rejectButtonProps: {
              label: 'Cancelar',
              severity: 'secondary',
              outlined: true,
          },
          accept: () => {
            if (!this.modoDescartados) {
              this.listaElementos = [];
            } else {
              this.listaElementosDescartados = [];
            }
            this.guardarListaElementos();
            this.guardarListaElementosDescartados();
          },
      });
  }

  anadirElementos() {
    this.listaElementos.push(...(this.elementosAnadir ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean));
    this.listaElementos = [...new Set(this.listaElementos)]; // Limpiamos duplicados
    this.guardarListaElementos();
    this.elementosAnadir = '';
  }

  editarElemento() {
    if (this.inputEditarElemento) {
      const idx = this.listaElementos.findIndex(ele => ele === this.inputEditarElementoOriginal);
      if (idx !== -1) {
        this.listaElementos[idx] = this.inputEditarElemento;
      }
      this.listaElementos = [...new Set(this.listaElementos)]; // Limpiamos duplicados
      this.dialogoEditarElementoVisible = false
      this.guardarListaElementos();
    } else {
      this.messageService.add({ severity: 'error', summary: 'No se puede poner vacío' });
    }
  }

  eliminarElemento(elemento: string) {
    this.listaElementos.splice(this.listaElementos.indexOf(elemento), 1);
    this.guardarListaElementos();
  }

  descartarIndice(indice: number) {
    this.listaElementosDescartados.unshift(this.listaElementos[indice]);
    this.listaElementosDescartados = [...new Set(this.listaElementosDescartados)]; // Limpiamos duplicados
    this.listaElementos.splice(indice, 1);
    this.guardarListaElementos();
    this.guardarListaElementosDescartados();
  }

  restaurarElemento(elemento: string) {
    if (!elemento || !this.listaElementosDescartados.length) {
      return;
    }
    
    /* Si ya lo tenia la lista, lo deberiamos reposicionar */
    if (this.listaElementos.includes(elemento)) {
      this.listaElementos.splice(this.listaElementos.indexOf(elemento), 1);
    }

    if (this.listaElementos.length) {
      const primerElemento: string = this.listaElementos[0];
      this.listaElementos.splice(0, 1);
      this.listaElementos.unshift(...[primerElemento, elemento]);
    } else {
      this.listaElementos.push(elemento);
    }
    
    this.listaElementosDescartados.splice(this.listaElementosDescartados.indexOf(elemento), 1);
    this.guardarListaElementos();
    this.guardarListaElementosDescartados();
    this.messageService.add({ severity: 'info', summary: 'Elemento recuperado' });
  }
}
