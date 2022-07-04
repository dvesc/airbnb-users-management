import { Date, Document } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type Phone_numbers_vo = Phone_numbers & Document;

@Schema()
export class Phone_numbers {
  @Prop({ type: String, required: true })
  user_id;
  @Prop({ type: String, required: true })
  country_code;
  @Prop({ type: Number, required: true })
  number;
  @Prop({ type: Date, default: Date.now })
  created_at;
  @Prop({ type: Date, default: Date.now })
  updated_at;
  @Prop({ type: Date, default: null })
  deleted_at;
}

export const phone_numbers_schema = SchemaFactory.createForClass(Phone_numbers);
