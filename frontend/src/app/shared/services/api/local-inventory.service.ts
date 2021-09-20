import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Inventory,
  LocalNodeService,
  Nic,
  NodeStatus,
  Volume
} from '~/app/shared/services/api/local.service';
import { PollService } from '~/app/shared/services/poll.service';

export type NICEntry = {
  name: string;
  info: Nic;
};

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryService {
  public inventory$: Observable<Inventory>;

  private inventorySource: ReplaySubject<Inventory> = new ReplaySubject<Inventory>(1);

  constructor(private localService: LocalNodeService, private pollService: PollService) {
    this.localService
      .status()
      .pipe(this.pollService.poll((status: NodeStatus) => !status.inited))
      .subscribe({
        next: (status: NodeStatus) => {
          console.log('checking node status: ', status);
          if (status.inited) {
            this.obtainInventory();
          }
        }
      });

    this.inventory$ = this.inventorySource.asObservable();
  }

  getDevices(): Observable<Volume[]> {
    return this.inventory$.pipe(map((inventory: Inventory) => inventory.disks));
  }

  getNICs(): Observable<NICEntry[]> {
    return this.inventory$.pipe(
      map((inventory: Inventory) => {
        const entries: NICEntry[] = [];
        Object.keys(inventory.nics).forEach((key: string) => {
          entries.push({
            name: key,
            info: inventory.nics[key]
          });
        });
        return entries;
      })
    );
  }

  private obtainInventory() {
    this.localService.inventory().subscribe({
      next: (inventory: Inventory) => {
        this.inventorySource.next(inventory);
      }
    });
  }
}
