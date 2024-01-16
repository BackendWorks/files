import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type FileDocument = HydratedDocument<File>;

@Schema()
export class File {
  @Prop()
  name: string;

  @Prop()
  userId: number;

  @Prop()
  key: string;

  @Prop()
  type: string;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;

  @Prop()
  isDeleted?: boolean;
}

export const FileSchema = SchemaFactory.createForClass(File);
