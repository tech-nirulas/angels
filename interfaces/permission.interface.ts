import { Localization } from "./localization.interface"
import { Role } from "./role.interface"
import { User } from "./user.interface"

export interface Permission {
  id: string
  documentId: string
  action: string
  actionParameters: string
  subject: string
  properties: string
  conditions: string
  role: Role
  createdAt: string
  updatedAt: string
  publishedAt: string
  createdBy: User
  updatedBy: User
  locale: string
  localizations: Localization[]
}