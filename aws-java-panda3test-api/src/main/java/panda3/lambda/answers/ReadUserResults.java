package panda3.lambda.answers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.serverless.ApiGatewayResponse;
import panda3.mappers.TablesMapperAnswers;
import panda3.model.TestResult;
import panda3.responses.ApiResponseHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class ReadUserResults implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {
    @Override
    public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {
        Map<String,String> pathParameters =  (Map<String,String>)input.get("pathParameters");
        try {
            List<TestResult> answer = new TablesMapperAnswers().getResultUser(pathParameters.get("userId"));
            return ApiResponseHandler.createResponse(answer, 200);
        } catch (IOException e) {
            return ApiResponseHandler.createResponse("cannot connect to database.", 401);
        }
    }
}
