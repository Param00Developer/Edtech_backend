export function dashboard(req,res){
    try{
        res.status(200).json({
            session:false,
            message:"Welcome to the dashboard"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}