import { Request } from 'express';
import * as moment from 'moment';
import * as R from 'ramda';
import { verify } from '../lib/auth';
import { Ranks } from '../lib/userRanks';
import { UserModel, UserEditModel, AdminUserEditModel, makeUserModel, UserAddModel } from '../models/User';
import { UserEntity } from '../entities/User';

export interface UsersManager {
  getOne:            (id: number) => Promise<UserModel | undefined>;
  getAll:            () => Promise<UserModel[]>;
  getCount:          () => Promise<number>;
  editExisting:      (user: UserEditModel) => Promise<UserModel | undefined>;
  adminEditExisting: (user: AdminUserEditModel) => Promise<UserModel | undefined>;
  verify:            (email: string, password: string) => Promise<UserModel | undefined>;
  emailExists:       (email: string) => Promise<boolean>;
  insertUser:        (user: UserAddModel) => Promise<UserModel | undefined>;
  insertAdmin:       (user: UserAddModel) => Promise<UserModel | undefined>;
  changePassword:    (email: string, password: string) => Promise<boolean>;
  setPasswordToken:  (email: string, token: string) => Promise<boolean>;
  isTokenValid:      (email: string, token: string, limitDate: Date) => Promise<boolean>;
  remove:            (id: number) => Promise<boolean>;
}

export function makeUsersManager(req: Request) {

  const that: UsersManager = {
    /**
     * Gets one user
     * @returns {Promise<UserModel|undefined>}
     */
    getOne: async (id: number): Promise<UserModel | undefined> => {
      const user = await req.db.manager.findOne(UserEntity, id);
      return (user) ? makeUserModel(user) : undefined;
    },

    /**
     * Gets all users
     * @returns {Promise<Array<UserModel>>}
     */
    getAll: async (): Promise<UserModel[]> => {
      const users = await req.db.manager.find(UserEntity);
      return R.map(makeUserModel, users);
    },

    /**
     * Counts how many users we have
     * @returns {Promise<number>}
     */
    getCount: async (): Promise<number> => {
      const users = await req.db.manager.find(UserEntity);
      return users.length;
    },

    /**
     * Edits a user
     * @returns {Promise<UserEditModel|undefined>}
     */
    editExisting: async (userEdit: UserEditModel): Promise<UserModel | undefined> => {
      try {
        const user = await req.db.manager.findOne(UserEntity, userEdit.id);

        if (!user)
          return undefined;

        user.display_name = userEdit.displayName;

        const savedUser = await req.db.manager.save(user);

        return makeUserModel(savedUser);
      } catch (e) {
        req.logger.error(e);
        return undefined;
      }
    },

    /**
     * Edits a user (with admin permissions)
     * @returns {Promise<AdminUserEditModel|undefined>}
     */
    adminEditExisting: async (userEdit: AdminUserEditModel): Promise<UserModel | undefined> => {
      try {
        const user = await req.db.manager.findOne(UserEntity, userEdit.id);

        if (!user)
          return undefined;

        user.display_name = userEdit.displayName;
        user.rank = userEdit.rank;

        const savedUser = await req.db.manager.save(user);

        return makeUserModel(savedUser);
      } catch (e) {
        req.logger.error(e);
        return undefined;
      }
    },

    /**
     * Checks if an email and password are in the database. If it does, returns the user, otherwise
     * undefined
     */
    verify: async (email: string, password: string): Promise<UserModel | undefined> => {
      const user = await req.db.manager.findOne(UserEntity, { email });

      if (user && await verify(password, user.password)) {
        return makeUserModel(user);
      } else {
        return undefined;
      }
    },

    /**
     * Checks if an email exists
     * @param {string} email
     * @returns {Promise<boolean>}
     */
    emailExists: async (email: string): Promise<boolean> => {
      return !!(await req.db.manager.findOne(UserEntity, { email }));
    },

    /**
     * Inserts a user in the database
     * @param {UserAddModel} p
     * @returns {Promise<UserModel | undefined>}
     */
    insertUser: async (p: UserAddModel): Promise<UserModel | undefined> => {
      try {
        const user = new UserEntity();
        user.email = p.email;
        user.display_name = p.email;
        user.password = p.password;

        const result = await req.db.manager.save(UserEntity, user);

        /* istanbul ignore next */
        return (result) ? makeUserModel(result) : undefined;
      } catch (e) {
        req.logger.error(e);
        return undefined;
      }
    },

    /**
     * Inserts an admin in the database
     * @param {UserAddModel} p
     * @returns {Promise<UserModel | undefined>}
     */
    insertAdmin: async (p: UserAddModel): Promise<UserModel | undefined> => {
      try {
        const user = new UserEntity();
        user.email = p.email;
        user.display_name = p.email;
        user.password = p.password;
        user.rank = Ranks.Admin;

        const result = await req.db.manager.save(UserEntity, user);

        /* istanbul ignore next */
        return (result) ? makeUserModel(result) : undefined;
      } catch (e) {
        req.logger.error(e);
        return undefined;
      }
    },

    /**
     * Changes the password of a user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    changePassword: async (email: string, password: string): Promise<boolean> => {
      const user = await req.db.manager.findOne(UserEntity, { email });

      if (!user) {
        return false;
      } else {
        user.password = password;
        const savedUser = await req.db.manager.save(user);
        return !!(savedUser);
      }
    },

    /**
     * Sets the password token for a user
     * @param {string} email
     * @param {string} token
     * @returns {Promise<>}
     */
    setPasswordToken: async (email: string, token: string): Promise<boolean> => {
      const user = await req.db.manager.findOne(UserEntity, { email });

      if (!user) {
        return false;
      } else {
        user.password_token = token;
        user.password_token_creation_date = (new Date()).toISOString();
        const savedUser = await req.db.manager.save(user);
        return !!(savedUser);
      }
    },

    /**
     * Checks if a password token is valid
     * @param {string} email
     * @param {string} token
     * @param {Date} limitDate
     * @returns {Promise<boolean>}
     */
    isTokenValid: async (email: string, token: string, limitDate: Date): Promise<boolean> => {
      const user = await req.db.manager.findOne(UserEntity, { email });

      const tokenIsValid = (u: UserEntity) => u.password_token === token &&
        moment(u.password_token_creation_date).isBefore(limitDate);

      return !!(user) && tokenIsValid(user);
    },

    /**
     * Removes a user
     * @returns {Promise<boolean>}
     */
    remove: async (id: number): Promise<boolean> => {
      try {
        const user = await req.db.manager.findOne(UserEntity, id);

        return !!(user) && !!(await req.db.manager.remove(user));
      } catch (e) {
        req.logger.error(e);
        return false;
      }
    },
  };

  return that;
}
