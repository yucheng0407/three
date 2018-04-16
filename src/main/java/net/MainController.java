package net;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by Administrator on 2018/4/11 0011.
 */
@Controller
@RequestMapping("/main")
public class MainController {
    @RequestMapping("/three")
    public String three() {
        return "three";
    }
    @RequestMapping("/get")
    public Map get(String id) {
        return new HashMap();
    }
}
