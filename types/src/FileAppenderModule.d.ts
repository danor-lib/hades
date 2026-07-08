import type { AppenderModule } from 'log4js';



export const moduleAppenderFile: AppenderModule;


/** Symbol to mark a log as an inline update */
export const symbolLogUpdate: unique symbol;
/** Symbol to mark a log as the end of an inline update */
export const symbolLogDone: unique symbol;
