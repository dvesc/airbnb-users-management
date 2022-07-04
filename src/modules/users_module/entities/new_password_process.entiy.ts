import { Date, Document } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type New_password_process_vo = New_password_process & Document;

@Schema()
export class New_password_process {
  @Prop({ type: String, required: true })
  email;
  @Prop({ type: String, required: true })
  process_code;
  @Prop({ type: String, default: 'generated' })
  status;
  @Prop({ type: Date, default: Date.now })
  emitted_at;
  @Prop({ type: Date, default: null })
  consumed_at;
}

export const new_password_process_schema =
  SchemaFactory.createForClass(New_password_process);
