import {Component} from 'angular2/core';
import {B} from './cmps_b_c';

@Component({
  selector: 'foo',
  directives: [B]
})
export class A {}