class  ApiResponce {
    constructor(status, message = "Success", data){
        this.status = status < 400;
        this.message = message;
        this.data = data; 
    }
}

export { ApiResponce }