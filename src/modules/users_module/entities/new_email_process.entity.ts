import { Date, Document } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type New_email_process_vo = New_email_process & Document;

@Schema()
export class New_email_process {
  @Prop({ type: String, required: true })
  user_id;
  @Prop({ type: String, required: true })
  new_email;
  @Prop({ type: String, required: true })
  process_code;
  @Prop({ type: String, default: 'generated' })
  status;
  @Prop({ type: Date, default: Date.now })
  emitted_at;
  @Prop({ type: Date, default: null })
  consumed_at;
}

export const new_email_process_schema =
  SchemaFactory.createForClass(New_email_process);
