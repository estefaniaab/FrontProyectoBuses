import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Recarga } from 'src/app/models/Recargas/recarga.model';
import { MetodoPagoCiudadano } from 'src/app/models/MetodosPagoCiudadano/metodo-pago-ciudadano.model';
import { Ciudadano } from 'src/app/models/Ciudadanos/ciudadano.model';

import { RecargaService } from 'src/app/services/Recarga/recarga.service';
import { MetodoPagoCiudadanoService } from 'src/app/services/MetodosPagoCiudadano/metodo-pago-ciudadano.service';
import { CiudadanoService } from 'src/app/services/Ciudadano/ciudadano.service';

@Component({
  selector: 'app-manage-recargas',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  mode: number; // 1: view, 2: create
  recarga: Recarga;
  theFormGroup: FormGroup;
  trySend: boolean;

  ciudadano?: Ciudadano;
  ciudadanoId?: number;

  tarjetas: MetodoPagoCiudadano[] = [];
  tarjetaSeleccionada: MetodoPagoCiudadano | null = null;

  montosPredefinidos: number[] = [
    10000,
    20000,
    50000,
    100000
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private theFormBuilder: FormBuilder,
    private recargaService: RecargaService,
    private metodoPagoCiudadanoService: MetodoPagoCiudadanoService,
    private ciudadanoService: CiudadanoService
  ) {
    this.trySend = false;

    this.recarga = {
      id: 0,
      metodoPagoCiudadanoId: 0,
      monto: 0,
      comision: 0,
      totalPagar: 0,
      estado: 'pendiente',
      referenciaInterna: '',
      referenciaEpayco: '',
      transaccionEpayco: '',
      aplicada: false,
      payloadEpayco: null
    };

    this.configFormGroup();
  }

  ngOnInit(): void {
    const currentUrl = this.activatedRoute.snapshot.url.join('/');

    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else {
      this.mode = 2;
    }

    this.cargarCiudadanoLogueado();

    if (this.activatedRoute.snapshot.params.id) {
      const id = Number(this.activatedRoute.snapshot.params.id);
      this.getRecarga(id);
    }

    if (this.mode === 1) {
      this.theFormGroup.disable();
    }
  }

  configFormGroup(): void {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0],
      metodoPagoCiudadanoId: ['', [Validators.required]],
      monto: [null, [
        Validators.required,
        Validators.min(5000),
        Validators.max(500000)
      ]],
      comision: [0],
      totalPagar: [0],
      estado: ['pendiente'],
      referenciaInterna: [''],
      referenciaEpayco: [''],
      transaccionEpayco: [''],
      aplicada: [false],
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getUsuarioIdLogueado(): string | null {
    const sessionRaw = localStorage.getItem('session');

    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);

        if (session.id) {
          return session.id;
        }

        if (session.token) {
          const payload = JSON.parse(atob(session.token.split('.')[1]));
          return payload.id || payload.sub || null;
        }
      } catch (error) {
        console.error('Error leyendo session del localStorage:', error);
        return null;
      }
    }

    return null;
  }

  cargarCiudadanoLogueado(): void {
    const usuarioId = this.getUsuarioIdLogueado();

    if (!usuarioId) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener el usuario que inició sesión.',
        icon: 'error'
      });

      return;
    }

    this.ciudadanoService.findByUsuarioId(usuarioId).subscribe({
      next: (ciudadano) => {
        this.ciudadano = ciudadano;
        this.ciudadanoId = ciudadano.id;

        if (!this.ciudadanoId) {
          Swal.fire({
            title: 'Error',
            text: 'El ciudadano no tiene un ID válido.',
            icon: 'error'
          });

          return;
        }

        this.cargarTarjetas();
      },
      error: (error) => {
        console.error('Error cargando ciudadano logueado:', error);

        Swal.fire({
          title: 'Error',
          text: error.error?.message || 'No se encontró un ciudadano asociado al usuario logueado.',
          icon: 'error'
        });
      }
    });
  }

  cargarTarjetas(): void {
    if (!this.ciudadanoId) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo identificar el ciudadano logueado.',
        icon: 'error'
      });

      return;
    }

    this.metodoPagoCiudadanoService.findRecargablesByCiudadano(this.ciudadanoId).subscribe({
      next: (response) => {
        this.tarjetas = response;

        if (this.tarjetas.length === 1 && this.mode === 2) {
          const unicaTarjeta = this.tarjetas[0];

          this.theFormGroup.patchValue({
            metodoPagoCiudadanoId: unicaTarjeta.id
          });

          this.tarjetaSeleccionada = unicaTarjeta;
          this.actualizarTotales();
        }
      },
      error: (error) => {
        console.error('Error cargando tarjetas:', error);

        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las tarjetas recargables del ciudadano.',
          icon: 'error'
        });
      }
    });
  }

  getRecarga(id: number): void {
    this.recargaService.view(id).subscribe({
      next: (response) => {
        this.recarga = response;

        this.theFormGroup.patchValue({
          id: response.id,
          metodoPagoCiudadanoId: response.metodoPagoCiudadanoId,
          monto: Number(response.monto),
          comision: Number(response.comision ?? 0),
          totalPagar: Number(response.totalPagar ?? response.monto ?? 0),
          estado: response.estado,
          referenciaInterna: response.referenciaInterna,
          referenciaEpayco: response.referenciaEpayco,
          transaccionEpayco: response.transaccionEpayco,
          aplicada: response.aplicada,
        });

        if (response.metodoPagoCiudadano) {
          this.tarjetaSeleccionada = response.metodoPagoCiudadano;
        }
      },
      error: (error) => {
        console.error('Error consultando recarga:', error);

        Swal.fire({
          title: 'Error',
          text: 'No se pudo consultar la recarga.',
          icon: 'error'
        });
      }
    });
  }

  onTarjetaChange(): void {
    const id = Number(this.theFormGroup.get('metodoPagoCiudadanoId')?.value);

    this.tarjetaSeleccionada = this.tarjetas.find(
      tarjeta => Number(tarjeta.id) === id
    ) || null;

    this.actualizarTotales();
  }

  seleccionarMonto(monto: number): void {
    this.theFormGroup.get('monto')?.setValue(monto);
    this.theFormGroup.get('monto')?.markAsTouched();

    this.actualizarTotales();
  }

  actualizarTotales(): void {
    const monto = this.montoRecarga;
    const comision = this.calcularComision(monto);
    const totalPagar = monto + comision;

    this.theFormGroup.patchValue({
      comision,
      totalPagar
    }, { emitEvent: false });
  }

  calcularComision(monto: number): number {
    if (!monto || monto <= 0) {
      return 0;
    }

    return 0;
  }

  get saldoActual(): number {
    return Number(this.tarjetaSeleccionada?.saldo ?? 0);
  }

  get montoRecarga(): number {
    return Number(this.theFormGroup.get('monto')?.value ?? 0);
  }

  get comision(): number {
    return Number(this.theFormGroup.get('comision')?.value ?? 0);
  }

  get totalPagar(): number {
    return Number(this.theFormGroup.get('totalPagar')?.value ?? 0);
  }

  get saldoDespues(): number {
    return this.saldoActual + this.montoRecarga;
  }

  back(): void {
    this.router.navigate(['/recargas/list']);
  }

  continuarAlPago(): void {
    this.trySend = true;
    this.actualizarTotales();

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Formulario inválido',
        text: 'Seleccione una tarjeta e ingrese un monto válido.',
        icon: 'error'
      });

      return;
    }

    const data: Recarga = {
      metodoPagoCiudadanoId: Number(this.theFormGroup.value.metodoPagoCiudadanoId),
      monto: Number(this.theFormGroup.value.monto)
    };

    this.recargaService.create(data).subscribe({
      next: (response: any) => {
        console.log('Respuesta recarga:', response);

        if (response.checkoutData) {
          this.abrirCheckoutEpayco(response.checkoutData);
          return;
        }

        Swal.fire({
          title: 'Recarga creada',
          text: 'La recarga quedó pendiente.',
          icon: 'success'
        });

        this.router.navigate(['/recargas/list']);
      },
      error: (error) => {
        console.error('Error creando recarga:', error);

        Swal.fire({
          title: 'Error',
          text: error.error?.message || 'No se pudo iniciar la recarga.',
          icon: 'error'
        });
      }
    });
  }

  cargarScriptEpayco(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).ePayco?.checkout) {
        resolve();
        return;
      }

      const scriptId = 'epayco-checkout-script';

      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.epayco.co/checkout.js';
      script.async = true;

      script.onload = () => {
        if ((window as any).ePayco?.checkout) {
          resolve();
        } else {
          reject('El script cargó, pero window.ePayco.checkout no está disponible.');
        }
      };

      script.onerror = () => {
        reject('No se pudo cargar https://checkout.epayco.co/checkout.js');
      };

      document.body.appendChild(script);
    });
  }

  async abrirCheckoutEpayco(checkoutData: any): Promise<void> {
    console.log('Datos checkout ePayco:', checkoutData);

    try {
      await this.cargarScriptEpayco();

      console.log('window.ePayco:', (window as any).ePayco);

      const handler = (window as any).ePayco.checkout.configure({
        key: checkoutData.key,
        test: checkoutData.test
      });

      handler.open({
        name: checkoutData.name,
        description: checkoutData.description,
        invoice: checkoutData.invoice,
        currency: checkoutData.currency,
        amount: checkoutData.amount,
        tax_base: checkoutData.tax_base,
        tax: checkoutData.tax,
        country: checkoutData.country,
        lang: checkoutData.lang,

        external: checkoutData.external,
        response: checkoutData.response,
        confirmation: checkoutData.confirmation,

        extra1: checkoutData.extra1,
        extra2: checkoutData.extra2,

        name_billing: checkoutData.name_billing,
        email_billing: checkoutData.email_billing,
        address_billing: checkoutData.address_billing,
        type_doc_billing: checkoutData.type_doc_billing,
        mobilephone_billing: checkoutData.mobilephone_billing,
        number_doc_billing: checkoutData.number_doc_billing,
      });

    } catch (error) {
      console.error('Error cargando ePayco:', error);

      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el checkout de ePayco.',
        icon: 'error'
      });
    }
  }
}
