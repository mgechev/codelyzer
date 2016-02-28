import {Component} from 'angular2/core';
import {B} from './cmps_b_c';
import {P1} from './pipe_p1';

@Component({
  selector: 'foo',
  directives: [B],
  pipes: [P1]
})
export class A {}
