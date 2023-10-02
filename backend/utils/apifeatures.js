class ApiFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr= queryStr;

    }
    search(){
        const keyword = this.queryStr.keyword
         ? {
            name:{
                $regex: this.queryStr.keyword,
                $options: "i"
            },

         }
            : {};
            this.query = this.query.find({...keyword});
            return this;

    }
    filter(){
        const queryCopy = {...this.queryStr};

        //removing some fields for category
        const removefields = ["keyword","page","limit"];
        removefields.forEach(key => delete queryCopy[key]);
        //filter for price and string
        let queryStr = JSON.stringify(queryCopy);
        queryStr= queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key) =>`$${key}`);
            
        
        this.query = this.query.find(queryCopy);
       

        return this;

    }
    pagination(){
        const currentPage = Number(this.queryStr.page )|| 1;

        const skip = resulPerPage * (currentPage - 1);
        this.query = this.query.limit(resulPerPage).skip(skip);
        
    }
}

module.exports =ApiFeatures;
