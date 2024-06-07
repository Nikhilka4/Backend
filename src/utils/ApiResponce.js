// this file is created to handle the format of api responce 

class  ApiResponce {
    constructor(status, message = "Success", data){ // we always want to send success message, statuscode and the data
        this.status = status < 400;
        this.message = message;
        this.data = data; 
    }
}

export { ApiResponce }