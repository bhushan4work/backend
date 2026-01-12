class ApiResponse {
     constructor(statusCode, data,message = "success"){
        //we overwrite here
        this.statusCode = statusCode,
        this.data = data,
        this.message =  message,
        this.success = statusCode < 400
     }
}