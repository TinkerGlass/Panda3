package panda3.mappers;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.serverless.DynamoDBAdapter;
import org.scalatest.prop.Tables;
import panda3.model.Test;
import panda3.model.TestAnswer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class    TablesMapperTest {
    private final DynamoDBMapper mapper;


    public TablesMapperTest(){
        DynamoDBMapperConfig mapperConfig = DynamoDBMapperConfig.builder()
                .withTableNameOverride(new DynamoDBMapperConfig.TableNameOverride("tests_table"))
                .build();
        DynamoDBAdapter db_adapter = DynamoDBAdapter.getInstance();
        this.mapper = db_adapter.createDbMapper(mapperConfig);
    }


    public List<Test> getAllTests() {
        return this.mapper.scan(Test.class, new DynamoDBScanExpression());
    }


    public void saveTest(Test test) {
        this.mapper.save(test);
    }

    public void deleteTest(String id) throws IOException {
        Test result = this.getTest(id);
        new TablesMapperAnswers().deleteAllTestsOnList(id);
        this.mapper.delete(result);
    }

    public void updateTest(Test test) throws IOException {
        this.mapper.delete(test);
        this.saveTest(test);
    }

    public Test getTest(String id) {
        Map<String, AttributeValue> eav = new HashMap<>();
        eav.put(":t_id", new AttributeValue().withS(id));
        DynamoDBQueryExpression<Test> query = new DynamoDBQueryExpression<Test>()
                .withKeyConditionExpression("id = :t_id")
                .withExpressionAttributeValues(eav);
        return this.mapper.query(Test.class, query).get(0);
    }


    public List<Test> getUserTest(String userId) throws IOException {
        List<TestAnswer> ans = new TablesMapperAnswers().getUserTests(userId);
        List<Test> answer = new ArrayList<>();
        for(TestAnswer an : ans){
            if(an.getAnswers() == null)
                answer.add(this.getTest(an.getTestId()));
        }
        return answer;
    }


    public Test getAddedTest(String recruiterId) {
        List<Test> tests = this.getAllTests();
        for (Test test : tests) {
            if (test.getRecruiterId() != null)
                if (test.getRecruiterId().equals(recruiterId))
                    return test;
        }
        return null;
    }


    public List<Test> getRecruiterTests(String userId){
        Map<String, AttributeValue> eav = new HashMap<>();
        eav.put(":val1", new AttributeValue().withS(userId));
        DynamoDBScanExpression scanRequest = new DynamoDBScanExpression()
                .withFilterExpression("recruiterId = :val1")
                .withExpressionAttributeValues(eav);
        return this.mapper.scan(Test.class, scanRequest);
    }
}
