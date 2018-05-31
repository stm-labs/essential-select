import { Component, OnInit } from '@angular/core';
import {EventBus} from '../core/eventbus/event-bus.service';
import {MaterialDesignClickedBusMessage} from '../core/eventbus/event-bus.message';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // useBootstrap = false;
  useBootstrap = true;

  openNavbar = false;

  useMaterialDesign = false;

  constructor(private eventBus: EventBus, public router: Router) { }

  ngOnInit() {
  }

  clickedMaterialDesign() {
    this.useMaterialDesign = !this.useMaterialDesign;
    this.eventBus.publish(new MaterialDesignClickedBusMessage());
  }

}
