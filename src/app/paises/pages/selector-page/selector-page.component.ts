import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisesService } from '../../services/paises.service';
import { PaisSmall } from '../../interfaces/paises.interface';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styleUrls: ['./selector-page.component.css']
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region: ['', [Validators.required]],
    pais: ['', [Validators.required]],
    frontera: ['', [Validators.required]],
  });

  regiones: string[] = [];
  paises: PaisSmall[] = [];
  fronteras: PaisSmall[] = [];

  cargando: boolean;

  constructor(private fb: FormBuilder,
              private paisesService: PaisesService ) { }

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;
    // 1ra forma: Cambio de region >> listar paises
    // this.miFormulario.get('region')?.valueChanges
    //   .subscribe(region => {
    //     this.paisesService.getPaisesPorRegion(region)
    //       .subscribe(paises => {
    //         this.paises = paises;
    //       });
    // });
    // 2da forma: Cambio de region >> listar paises
    this.miFormulario.get('region')?.valueChanges
        .pipe(
          tap(( _ ) => {
            this.miFormulario.get('pais')?.reset('');
            this.cargando = true;
          }),
          switchMap(region => this.paisesService.getPaisesPorRegion(region))
        )
        .subscribe(paises => {
          this.paises = paises;
          this.cargando = false;
        });
    // Cambio de paises >> listar fronteras
    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        tap(() => {
          this.fronteras = [];
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        switchMap(codigo => this.paisesService.getPaisPorCodigo(codigo)),
        switchMap(pais => this.paisesService.getPaisesPorCodigo(pais?.borders)!)
      )
      .subscribe(paises => {
        this.fronteras = paises;
        this.cargando = false;
    })
  }

  guardar() {
    console.log(this.miFormulario);
  }

}
