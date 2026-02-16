/**
 * BCH-Action JSON Schema v1.1.0 Types
 */

export interface BlinchActionMetadata {
  protocol: string;
  identifier: string;
  hex_prefix: string;
}

export interface ActionParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date';
  required?: boolean;
  default?: string | number | boolean;
}

export interface ActionLink {
  label: string;
  href: string;
  parameters?: ActionParameter[];
}

export interface ActionLinks {
  actions: ActionLink[];
  [key: string]: any;
}

export interface BlinchActionSchema {
  version: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  links: ActionLinks;
  metadata: BlinchActionMetadata;
}

/**
 * Storage model for actions
 */
export interface ActionModel extends BlinchActionSchema {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create action request
 */
export interface CreateActionRequest {
  title: string;
  description: string;
  recipientAddress: string;
  amount?: string;
  parameters?: ActionParameter[];
  iconUrl?: string;
}

/**
 * Query parameters for action endpoint
 */
export interface ActionQueryParams {
  id: string;
  format?: 'json' | 'html';
}
