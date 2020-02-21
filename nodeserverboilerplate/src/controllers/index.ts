import { Props } from '../views/routes';
import { ControllerMethod } from '../interfaces';

export namespace Input { }

const controller: {
  get: ControllerMethod,
} = {

  /**
   * Gets the main page
   */
  get: async (req, res, next) => {
    const props: Props = {
      req,
    };

    res.render('index', props);
  },

};

export { controller };
