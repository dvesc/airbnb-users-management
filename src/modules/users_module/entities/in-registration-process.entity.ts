import { Date, Document } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type Registration_process_vo = Registration_process & Document;

@Schema()
export class Registration_process {
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

export const registration_process_schema =
  SchemaFactory.createForClass(Registration_process);

/*export interface Registration_process_vo {
  email: string;
  process_code: string;
  status: string; // generated, consumed
  emitted_at: Date;
  consumed_at: Date;
}

export const registration_process_schema = new Schema<Registration_process_vo>(
  {
    email: { type: String, required: true },
    process_code: { type: String, required: true },
    status: { type: String, default: 'generated' },
    emitted_at: { type: Date, default: Date.now },
    consumed_at: { type: Date, default: null },
  },
  { versionKey: false, supressReservedKeysWarning: true },
);
*/
