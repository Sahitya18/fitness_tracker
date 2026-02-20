package com.fitness.register_service.dto;

import lombok.Data;
import org.slf4j.event.KeyValuePair;

import java.util.List;

@Data
public class UpdateRequest {
    private List<KeyValuePair> keyValuePairList;
}
