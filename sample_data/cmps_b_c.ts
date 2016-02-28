import {Component} from 'angular2/core';
import {D} from './dir_d';

@Component({
  selector: 'c',
  template: 'c'
})
export class C {}

@Component({
  selector: 'b',
  template: '<c></c><div d></div>',
  directives: [D, C],
  inputs: ['foo']
})
export class B {}
