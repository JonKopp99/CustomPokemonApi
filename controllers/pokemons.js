const express = require('express');

const router = express.Router();
const User = require("../models/user");
const Pokemon = require('../models/pokemon');
router.get('/', (req, res) => {
        var currentUser = req.user;
        console.log(currentUser.username)
        // res.render('home', {});
        console.log(req.cookies);
        Pokemon.find().populate('author')
        .then(pokemons => {
            res.render('pokemons-index', { pokemons, currentUser });
            // res.render('home', {});
        }).catch(err => {
            console.log(err.message);
        })
    })

router.get('/new',(req,res) => {
   res.render('pokemons-new')
})
router.post("/new", (req, res) => {
        if (req.user) {

            var pokemon = new Pokemon(req.body);
            pokemon.author = req.user._id;

            pokemon
                .save()
                .then(pokemon => {
                    return User.findById(req.user._id);
                })
                .then(user => {
                    user.pokemons.unshift(pokemon);
                    user.save();
                    // REDIRECT TO THE NEW POST
                    res.redirect(`/`);
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            return res.status(401); // UNAUTHORIZED
        }
    });

router.get("/:id", function (req, res) {
    console.log("USERNAME IS",req.user.username)
    var currentUser = req.user;
    Pokemon.findById(req.params.id).populate('comments').lean()
        .then(Pokemon => {
            res.render("pokemons-show", { Pokemon, currentUser });
        })
        .catch(err => {
            console.log(err.message);
        });
});
router.get("/:pokemonId/delete", function (req, res) {
    Pokemon.findById(req.params.pokemonId)
        .then(Pokemon => {
            let thePokeOwner = Pokemon.author.username
            console.log(thePokeOwner)
            if(thePokeOwner === currentUser.username)
            {
                console.log("Its a match!")
                Pokemon.remove()
            }else{
                console.log("Not your pokemon buddy")
            }
            res.redirect("/")
        })
        .catch(err => {
            console.log(err.message);
        });

    // Pokemon.findById(req.params.pokemonId).remove()
    //     .then(Pokemon => {
    //         res.redirect("/")
    //     })
    //     .catch(err => {
    //         console.log(err.message);
    //     });
})
router.delete("/:pokemonId/delete", function (req, res) {
    console.log("DELETE")
})

// CREATE Comment
 const Comment = require('../models/comment');
 router.post("/:pokemonId/comments", function (req, res) {
        const comment = new Comment(req.body);
        comment.author = req.user._id;
        comment
            .save()
            .then(comment => {
                return Promise.all([
                    Pokemon.findById(req.params.pokemonId)
                ]);
            })
            .then(([Pokemon, user]) => {
                Pokemon.comments.unshift(comment);
                return Promise.all([
                    Pokemon.save()
                ]);
            })
            .then(Pokemon => {
                res.redirect(`/pokemons/${req.params.pokemonId}`);
            })
            .catch(err => {
                console.log(err);
            });
    });

    router.get("/:pokemonId/comments/:commentId/replies/new", (req, res) => {
    let pokemon;
    Pokemon.findById(req.params.PokemonId)
      .then(p => {
        pokemon = p;
        return Comment.findById(req.params.commentId);
      })
      .then(comment => {
        res.render("replies-new", { pokemon, comment });
      })
      .catch(err => {
        console.log(err.message);
      });
  });
  router.get("/:pokemonId/comments/:commentId/replies", (req, res) => {
      console.log("Get replies working....")
      res.redirect(`/pokemons/${req.params.pokemonId}`);
  })
  // CREATE REPLY
  router.post("/:pokemonId/comments/:commentId/replies", (req, res) => {
    // TURN REPLY INTO A COMMENT OBJECT
    console.log("Replies/new")
    const reply = new Comment(req.body);
    reply.author = req.user._id
    // LOOKUP THE PARENT POST
    Pokemon.findById(req.params.PokemonId)
        .then(Pokemon => {
            // FIND THE CHILD COMMENT
            console.log("Comment found")
            Promise.all([
                reply.save(),
                Comment.findById(req.params.commentId),
            ])
                .then(([reply, comment]) => {
                    // ADD THE REPLY
                    comment.comments.unshift(reply._id);

                    return Promise.all([
                        comment.save(),
                    ]);
                })
                .then(() => {
                    res.redirect(`/pokemons/${req.params.PokemonId}`);
                })
                .catch(console.error);
            // SAVE THE CHANGE TO THE PARENT DOCUMENT
            console.log("Saving reply")
            return Pokemon.save();
        })
});

module.exports = router;
