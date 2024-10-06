import { Response } from 'express';

// Define the structure of the response handlers
interface ResponseHandler {
  (res: Response, customMessage?: string, data?: any): Response;
}

// Define the structure of each category and code
interface ResponseCodes {
  [category: string]: {
    [code: string]: ResponseHandler;
  };
}

// Custom Errors for code handling
class CodeAlreadyExistsError extends Error {
  constructor(code: string, category: string) {
    super(`Response code "${code}" already exists in category "${category}".`);
    this.name = 'CodeAlreadyExistsError';
  }
}

class CodeNotFoundError extends Error {
  constructor(code: string, category: string) {
    super(`Response code "${code}" not found in category "${category}".`);
    this.name = 'CodeNotFoundError';
  }
}

// Main response codes object
export const responseCodes: ResponseCodes = {
  // Success responses (2xx)
  success: {
    ok: (res: Response, customMessage: string = 'OK', data: any = null) => {
      return res.status(200).json({ status: 200, message: customMessage, data });
    },
    created: (res: Response, customMessage: string = 'Created', data: any = null) => {
      return res.status(201).json({ status: 201, message: customMessage, data });
    },
    accepted: (res: Response, customMessage: string = 'Accepted', data: any = null) => {
      return res.status(202).json({ status: 202, message: customMessage, data });
    }
  },
  // Client Error responses (4xx)
  clientError: {
    badRequest: (res: Response, customMessage: string = 'Bad Request', data: any = null) => {
      return res.status(400).json({ status: 400, message: customMessage, data });
    },
    unauthorized: (res: Response, customMessage: string = 'Unauthorized', data: any = null) => {
      return res.status(401).json({ status: 401, message: customMessage, data });
    },
    forbidden: (res: Response, customMessage: string = 'Forbidden', data: any = null) => {
      return res.status(403).json({ status: 403, message: customMessage, data });
    },
    notFound: (res: Response, customMessage: string = 'Not Found', data: any = null) => {
      return res.status(404).json({ status: 404, message: customMessage, data });
    }
  },
  // Server Error responses (5xx)
  serverError: {
    internalServerError: (res: Response, customMessage: string = 'Internal Server Error', data: any = null) => {
      return res.status(500).json({ status: 500, message: customMessage, data });
    }
  }
};

// Helper functions
const codeExists = (category: keyof ResponseCodes, code: string): boolean => {
  return responseCodes[category] && responseCodes[category][code] !== undefined;
};

const categoryExists = (category: string): boolean => {
  return responseCodes[category] !== undefined;
};

// Add a new response code
export const addResponseCode = (
  category: string,
  code: string,
  statusCode: number,
  defaultMessage: string,
  defaultData: any = null
) => {
  if (!categoryExists(category)) {
    responseCodes[category] = {};
  }
  if (codeExists(category, code)) {
    throw new CodeAlreadyExistsError(code, category);
  }
  responseCodes[category][code] = (res: Response, customMessage: string = defaultMessage, data: any = defaultData) => {
    return res.status(statusCode).json({ status: statusCode, message: customMessage, data });
  };
};

// Remove a response code
export const removeResponseCode = (category: string, code: string) => {
  if (!categoryExists(category)) {
    throw new CodeNotFoundError(code, category);
  }
  if (!codeExists(category, code)) {
    throw new CodeNotFoundError(code, category);
  }
  delete responseCodes[category][code];
};
