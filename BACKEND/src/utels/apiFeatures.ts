import { Query } from 'mongoose';

class APIFeatures<T> {
    query: Query<T[], T>;
    queryString: any;

    constructor(query: Query<T[], T>, queryString: any) {
        this.query = query;
        this.queryString = queryString;
    }

    // filter() {
    //     // 1A) FILTERING
    //     const queryObj: any = { ...this.queryString };
    //     let filters: string[] = [];
    //     if(this.queryString.category){
    //         filters = this.queryString.category?.split(',').map((item: string) => item.trim());
    //     }
    //     const excludeFields: string[] = ['page', 'sort', 'limit', 'fields','category']; // Exclude 'category' from excludeFields
    //     excludeFields.forEach((el: string) => delete queryObj[el]);
    
    //     // 1B) ADVANCED FILTERING
    //     let query: any = this.query.find(queryObj); // Construct query object directly
    //         console.log(this.queryString.category)
    //          // Split and trim categories
    //     if(filters.length > 0){
    //         query = query.find({
    //             $or: [
    //                 { category: { $in: filters } }, // Match categories
    //                 { subCategory: { $in: filters } } // Match subcategories (use $in)
    //             ]
    //         });
    //     }
    //     console.log(query);
    //     this.query = query;
    //     return this;
    // }
    filter() {
        // 1A) FILTERING
        const queryObj: any = { ...this.queryString };
        const excludeFields: string[] = ['page', 'sort', 'limit', 'fields', 'category', 'subCategory'];
        excludeFields.forEach((el: string) => delete queryObj[el]);
    
        // 1B) ADVANCED FILTERING (for other fields)
        let query: any = this.query.find(queryObj);
    
        // Check for hierarchical filtering
        if (this.queryString.category) {
            const categoryFilters: string[] = this.queryString.category
                .split(',')
                .map((item: string) => item.trim());
    
            // Start with category filtering
            query = query.find({
                category: { $in: categoryFilters },
            });
            // Apply subcategory filtering only if subCategory is specified
            if (this.queryString.subCategory) {
                const subCategoryFilters: string[] = this.queryString.subCategory
                    .split(',')
                    .map((item: string) => item.trim());
    
                query = query.find({
                    $and: [
                        { category: { $in: categoryFilters } }, // Parent category condition
                        { subCategory: { $in: subCategoryFilters } }, // Subcategory condition
                    ],
                }); 
            }
        }
        this.query = query;
        return this;
    }

    sort(defaultField: string = 'createdAt') {
        //2) sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort(`${defaultField} _id`);
        } 
        
        return this;
    }

    limitFields() {
        //3) FIELD LIMITING
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        // 3) PAGINATION
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit; 

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

export default APIFeatures;
