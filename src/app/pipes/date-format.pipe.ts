import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
    transform(value: Date | moment.Moment | null, dateFormat: string): any {
        return value ? moment(value).format(dateFormat) : '';
    }
}