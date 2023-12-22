package com.ground.sswm.tree.service;

import com.ground.sswm.tree.model.Tree;
import com.ground.sswm.tree.model.dto.TreeDto;
import com.ground.sswm.tree.repository.TreeRepository;
import com.ground.sswm.user.model.dto.UserDto;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TreeServiceImpl implements TreeService {

    private final TreeRepository treeRepository;

    public void saveTree(TreeDto treeDto) {
        Tree tree = Tree.from(treeDto);
        treeRepository.save(tree);
    }
}
