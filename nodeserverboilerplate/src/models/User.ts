import * as inspector from 'schema-inspector';

import { Ranks, getRankName } from '../lib/userRanks';
import { MAX_STR_LEN } from './partials/constants';
import { id, NAME } from './partials/primitives';
import { UserEntity } from '../entities/User';

const schemaPartials = {
  email: {
    sanitization: {type: 'string', rules: ['trim', 'lower'], maxLength: MAX_STR_LEN},
    validation: {type: 'string', optional: false},
  },
  displayName: {
    sanitization: {type: 'string', rules: ['trim'], maxLength: MAX_STR_LEN},
    validation: {type: 'string', optional: false},
  },
  password: {
    sanitization: {type: 'string', maxLength: MAX_STR_LEN},
    validation: {type: 'string', optional: false},
  },
  rankName: {
    sanitization: {type: 'string', rules: ['trim'], maxLength: MAX_STR_LEN},
    validation: {type: 'string', optional: false},
  },
  rank: {
    sanitization: {type: 'integer'},
    validation: {type: 'integer', optional: false, max: MAX_STR_LEN},
  },
};

const schema = {
  UserModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:        NAME.sanitization,
        id:          id.sanitization,
        email:       schemaPartials.email.sanitization,
        displayName: schemaPartials.displayName.sanitization,
        rankName:    schemaPartials.rankName.sanitization,
        rank:        schemaPartials.rank.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:        NAME.validation,
        id:          id.validation,
        email:       schemaPartials.email.validation,
        displayName: schemaPartials.displayName.validation,
        rankName:    schemaPartials.rankName.validation,
        rank:        schemaPartials.rank.validation,
      },
    },
  },

  UserAddModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:     NAME.sanitization,
        email:    schemaPartials.email.sanitization,
        password: schemaPartials.password.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:     NAME.validation,
        email:    schemaPartials.email.validation,
        password: schemaPartials.password.validation,
      },
    },
  },

  UserEditModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:        NAME.sanitization,
        id:          id.sanitization,
        displayName: schemaPartials.displayName.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:        NAME.validation,
        id:          id.validation,
        displayName: schemaPartials.displayName.validation,
      },
    },
  },

  AdminUserEditModel: {
    sanitization: {
      type: 'object',
      strict: true,
      properties: {
        NAME:        NAME.sanitization,
        id:          id.sanitization,
        displayName: schemaPartials.displayName.sanitization,
        rank:        schemaPartials.rank.sanitization,
      },
    },
    validation: {
      type: 'object',
      strict: true,
      properties: {
        NAME:        NAME.validation,
        id:          id.validation,
        displayName: schemaPartials.displayName.validation,
        rank:        schemaPartials.rank.validation,
      },
    },
  },
};

export { schema };

export interface UserModel {
  NAME: string;
  id: number;
  email: string;
  rank: Ranks;
  displayName: string;
  rankName: string;
}

export interface UserAddModel {
  NAME: string;
  email: string;
  password: string;
}

export interface UserEditModel {
  NAME: string;
  id: number;
  displayName: string;
}

export interface AdminUserEditModel {
  NAME: string;
  id: number;
  rank: Ranks;
  displayName: string;
}

export function makeUserModel(p: UserEntity): UserModel {
  const that: UserModel = {
    NAME: 'UserModel',
    id: p.id,
    email: p.email,
    rank: p.rank,
    displayName: p.display_name,
    rankName: getRankName(p.rank),
  };

  inspector.sanitize(schema.UserModel.sanitization, that);
  const vResult = inspector.validate(schema.UserModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}

export function makeUserAddModel(p: { email: string, password: string }): UserAddModel {
  const that: UserAddModel = {
    NAME: 'UserAddModel',
    ...p,
  };

  inspector.sanitize(schema.UserAddModel.sanitization, that);
  const vResult = inspector.validate(schema.UserAddModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}

export function makeUserEditModel(p: { id: number, displayName: string }): UserEditModel {
  const that: UserEditModel = {
    NAME: 'UserEditModel',
    ...p,
  };

  inspector.sanitize(schema.UserEditModel.sanitization, that);
  const vResult = inspector.validate(schema.UserEditModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}

export function makeAdminUserEditModel(p: { id: number, rank: number, displayName: string }): AdminUserEditModel {
  const that: AdminUserEditModel = {
    NAME: 'AdminUserEditModel',
    ...p,
  };

  inspector.sanitize(schema.AdminUserEditModel.sanitization, that);
  const vResult = inspector.validate(schema.AdminUserEditModel.validation, that);
  if (!vResult.valid) {
    throw new Error(vResult.format());
  }

  return that;
}
