// this file is created to handle the format of api responce 

class  ApiResponce {
    constructor(statusCode, data, message = "Success"){ // we always want to send success message, statuscode and the data
        this.statusCode = statusCode;
        this.data = data; 
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponce }