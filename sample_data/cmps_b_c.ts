import {Component} from 'angular2/core';
import {D} from './dir_d';

@Component({
  selector: 'c'
})
export class C {}

@Component({
  selector: 'b',
  directives: [D, C]
})
export class B {}
