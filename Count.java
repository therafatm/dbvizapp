import java.io.*;

public class Count {

    public static void main(String[] args) throws Exception
    {
        double x = -1;
        while(true){
            if(x>=0){
                System.out.println("{\"table_name\": \"sports\",\"column_name\": \"student_id\",\"referenced_table_name\": \"students\",\"Referenced_column_name\": \"student_id\",\"parsedForeignKey\": true}");
                return;
            }
            else{
                x+= 0.01;
            }
        }
    }
}


